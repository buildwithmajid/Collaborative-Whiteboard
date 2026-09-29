import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import type { WhiteboardObject } from '@whiteboard/shared';
import ShapeRenderer from './ShapeRenderer';
import type { ToolMode, DrawingState } from '../types';
import { createRectangle, createCircle } from '../utils/shapeFactory';

interface CanvasStageProps {
  objects: Map<string, WhiteboardObject>;
  onAddObject: (obj: WhiteboardObject) => void;
  onUpdateObject: (id: string, obj: WhiteboardObject) => void;
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
  toolMode: ToolMode;
  userId: string;
  onMouseMove: (x: number, y: number) => void;
  onMouseLeave: () => void;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
  objects,
  onAddObject,
  onUpdateObject,
  selectedId,
  onSelectionChange,
  toolMode,
  userId,
  onMouseMove,
  onMouseLeave,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
  });
  const lastUpdateRef = useRef<number>(0);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const { x, y } = stage.getPointerPosition() || { x: 0, y: 0 };
    
    if (drawingState.isDrawing) return;

    const now = Date.now();
    if (now - lastUpdateRef.current > 50) {
      onMouseMove(x, y);
      lastUpdateRef.current = now;
    }

    lastPositionRef.current = { x, y };
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    const { x, y } = stage.getPointerPosition() || { x: 0, y: 0 };

    if (toolMode === 'select') {
      const clickedShape = e.target;
      if (clickedShape.name() === 'shape') {
        onSelectionChange(clickedShape.id());
      } else {
        onSelectionChange(null);
      }
    } else {
      setDrawingState({
        isDrawing: true,
        startX: x,
        startY: y,
      });
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawingState.isDrawing) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const { x, y } = stage.getPointerPosition() || { x: 0, y: 0 };
    const width = Math.max(1, Math.abs(x - drawingState.startX));
    const height = Math.max(1, Math.abs(y - drawingState.startY));
    const finalX = Math.min(drawingState.startX, x);
    const finalY = Math.min(drawingState.startY, y);

    setDrawingState({ isDrawing: false, startX: 0, startY: 0 });

    if (width < 5 && height < 5) return;

    let newObject: WhiteboardObject | null = null;

    if (toolMode === 'rectangle') {
      newObject = createRectangle(finalX, finalY, width, height, userId);
    } else if (toolMode === 'circle') {
      const radius = Math.min(width, height) / 2;
      newObject = createCircle(finalX + radius, finalY + radius, radius, userId);
    }

    if (newObject) {
      onAddObject(newObject);
      onSelectionChange(newObject.id);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const obj = objects.get(id);
    if (obj) {
      onUpdateObject(id, {
        ...obj,
        x: e.target.x(),
        y: e.target.y(),
        lastModifiedBy: userId,
        updatedAt: Date.now(),
      });
    }
  };

  useEffect(() => {
    const handleWindowMouseLeave = () => {
      onMouseLeave();
    };

    window.addEventListener('mouseleave', handleWindowMouseLeave);
    return () => {
      window.removeEventListener('mouseleave', handleWindowMouseLeave);
    };
  }, [onMouseLeave]);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleStageMouseMove}
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <Layer>
        {Array.from(objects.values()).map((obj) => (
          <ShapeRenderer
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedId}
            onSelect={() => onSelectionChange(obj.id)}
            onDragEnd={handleDragEnd}
            isDraggable={toolMode === 'select'}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default CanvasStage;
