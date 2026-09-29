import React from 'react';
import { Rect, Circle } from 'react-konva';
import Konva from 'konva';
import type { WhiteboardObject } from '@whiteboard/shared';

interface ShapeRendererProps {
  object: WhiteboardObject;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  isDraggable: boolean;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  object,
  isSelected,
  onSelect,
  onDragEnd,
  isDraggable,
}) => {
  const strokeColor = isSelected ? '#000' : object.stroke;
  const strokeWidth = isSelected ? 3 : object.strokeWidth;

  const commonProps = {
    id: object.id,
    name: 'shape',
    x: object.x,
    y: object.y,
    fill: object.fill,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    onClick: onSelect,
    draggable: isDraggable,
    onDragEnd: onDragEnd,
  };

  if (object.type === 'rectangle') {
    return (
      <Rect
        {...commonProps}
        width={object.width}
        height={object.height}
      />
    );
  }

  if (object.type === 'circle') {
    const radius = (object.width || 0) / 2;
    return (
      <Circle
        {...commonProps}
        radius={radius}
      />
    );
  }

  return null;
};

export default ShapeRenderer;
