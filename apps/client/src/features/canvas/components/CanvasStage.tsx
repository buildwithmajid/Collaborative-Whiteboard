import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import type { WhiteboardObject } from '@whiteboard/shared';
import ShapeRenderer from './ShapeRenderer';
import SelectionBox from './SelectionBox';
import type { ToolMode, DrawingState } from '../types';
import { createRectangle, createCircle } from '../utils/shapeFactory';

interface SelectionBoxState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface CanvasStageProps {
  objects: Map<string, WhiteboardObject>;
  onAddObject: (obj: WhiteboardObject) => void;
  onUpdateObject: (id: string, changes: Partial<WhiteboardObject>) => void;
  onDeleteObjects: (ids: string[]) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  toolMode: ToolMode;
  userId: string;
  onMouseMove: (x: number, y: number) => void;
  onMouseLeave: () => void;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
  objects,
  onAddObject,
  onUpdateObject,
  onDeleteObjects,
  selectedIds,
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
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  // Track drag start positions for multi-select group drag
  const dragStartPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);

  const lastUpdateRef = useRef<number>(0);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const { x, y } = pos;

    // Update selection box if we're in select-drag mode
    if (selectionBox.isSelecting) {
      setSelectionBox((prev) => ({ ...prev, currentX: x, currentY: y }));
      return;
    }

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

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const { x, y } = pos;

    if (toolMode === 'select') {
      const clickedShape = e.target;
      if (clickedShape.name() === 'shape') {
        const clickedId = clickedShape.id();
        if (e.evt.shiftKey) {
          // Shift+click: toggle this shape in the selection
          if (selectedIds.includes(clickedId)) {
            onSelectionChange(selectedIds.filter((id) => id !== clickedId));
          } else {
            onSelectionChange([...selectedIds, clickedId]);
          }
        } else if (!selectedIds.includes(clickedId)) {
          // Click on unselected shape: select only this one
          onSelectionChange([clickedId]);
        }
        // If clicking an already-selected shape without shift, keep selection as-is
        // (allows dragging the group)
      } else {
        // Clicked on empty canvas area: start selection box
        if (!e.evt.shiftKey) {
          onSelectionChange([]);
        }
        setSelectionBox({
          isSelecting: true,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
        });
      }
    } else {
      // Drawing mode
      setDrawingState({
        isDrawing: true,
        startX: x,
        startY: y,
      });
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle selection box completion
    if (selectionBox.isSelecting) {
      const boxX = Math.min(selectionBox.startX, selectionBox.currentX);
      const boxY = Math.min(selectionBox.startY, selectionBox.currentY);
      const boxW = Math.abs(selectionBox.currentX - selectionBox.startX);
      const boxH = Math.abs(selectionBox.currentY - selectionBox.startY);

      if (boxW > 5 || boxH > 5) {
        // Find all shapes inside the selection box
        const hitIds: string[] = [];
        objects.forEach((obj) => {
          const objRight = obj.x + (obj.width || 0);
          const objBottom = obj.y + (obj.height || 0);
          // Check if shape overlaps with selection box
          if (
            obj.x < boxX + boxW &&
            objRight > boxX &&
            obj.y < boxY + boxH &&
            objBottom > boxY
          ) {
            hitIds.push(obj.id);
          }
        });

        if (e.evt.shiftKey) {
          // Shift+drag: add to existing selection
          const merged = [...new Set([...selectedIds, ...hitIds])];
          onSelectionChange(merged);
        } else {
          onSelectionChange(hitIds);
        }
      }

      setSelectionBox({
        isSelecting: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      });
      return;
    }

    // Handle drawing completion
    if (!drawingState.isDrawing) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const { x, y } = pos;

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
      onSelectionChange([newObject.id]);
    }
  };

  // Group drag: when dragging one selected shape, move all selected shapes together
  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    const draggedId = e.target.id();
    if (!selectedIds.includes(draggedId) || selectedIds.length <= 1) return;

    // Save starting positions of all selected shapes
    dragOriginRef.current = { x: e.target.x(), y: e.target.y() };
    const positions = new Map<string, { x: number; y: number }>();
    selectedIds.forEach((id) => {
      const obj = objects.get(id);
      if (obj) {
        positions.set(id, { x: obj.x, y: obj.y });
      }
    });
    dragStartPosRef.current = positions;
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const draggedId = e.target.id();
    if (!selectedIds.includes(draggedId) || selectedIds.length <= 1) return;
    if (!dragOriginRef.current) return;

    const dx = e.target.x() - dragOriginRef.current.x;
    const dy = e.target.y() - dragOriginRef.current.y;

    // Move other selected shapes by the same delta
    const stage = stageRef.current;
    if (!stage) return;

    selectedIds.forEach((id) => {
      if (id === draggedId) return;
      const node = stage.findOne(`#${id}`);
      const startPos = dragStartPosRef.current.get(id);
      if (node && startPos) {
        node.x(startPos.x + dx);
        node.y(startPos.y + dy);
      }
    });

    stage.batchDraw();
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const draggedId = e.target.id();

    if (selectedIds.includes(draggedId) && selectedIds.length > 1 && dragOriginRef.current) {
      // Multi-select group drag: compute final positions for all selected
      const dx = e.target.x() - dragOriginRef.current.x;
      const dy = e.target.y() - dragOriginRef.current.y;

      selectedIds.forEach((id) => {
        const startPos = dragStartPosRef.current.get(id);
        if (startPos) {
          onUpdateObject(id, {
            x: startPos.x + dx,
            y: startPos.y + dy,
            lastModifiedBy: userId,
            updatedAt: Date.now(),
          });
        }
      });

      dragOriginRef.current = null;
      dragStartPosRef.current.clear();
    } else {
      // Single shape drag
      const obj = objects.get(draggedId);
      if (obj) {
        onUpdateObject(draggedId, {
          x: e.target.x(),
          y: e.target.y(),
          lastModifiedBy: userId,
          updatedAt: Date.now(),
        });
      }
    }
  };

  // Delete/Backspace handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if (selectedIds.length > 0) {
          e.preventDefault();
          onDeleteObjects(selectedIds);
          onSelectionChange([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, onDeleteObjects, onSelectionChange]);

  useEffect(() => {
    const handleWindowMouseLeave = () => {
      onMouseLeave();
    };

    window.addEventListener('mouseleave', handleWindowMouseLeave);
    return () => {
      window.removeEventListener('mouseleave', handleWindowMouseLeave);
    };
  }, [onMouseLeave]);

  // Compute selection box rectangle (handle drag in any direction)
  const selBoxX = Math.min(selectionBox.startX, selectionBox.currentX);
  const selBoxY = Math.min(selectionBox.startY, selectionBox.currentY);
  const selBoxW = Math.abs(selectionBox.currentX - selectionBox.startX);
  const selBoxH = Math.abs(selectionBox.currentY - selectionBox.startY);

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
            isSelected={selectedIds.includes(obj.id)}
            onSelect={() => {
              if (!selectedIds.includes(obj.id)) {
                onSelectionChange([obj.id]);
              }
            }}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            isDraggable={toolMode === 'select'}
          />
        ))}
        <SelectionBox
          visible={selectionBox.isSelecting}
          x={selBoxX}
          y={selBoxY}
          width={selBoxW}
          height={selBoxH}
        />
      </Layer>
    </Stage>
  );
};

export default CanvasStage;
