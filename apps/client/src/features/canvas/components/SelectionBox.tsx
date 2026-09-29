import React from 'react';
import { Rect } from 'react-konva';

interface SelectionBoxProps {
  /** Whether the user is currently drawing the selection box */
  visible: boolean;
  /** Top-left X of the selection box (computed from start/current) */
  x: number;
  /** Top-left Y of the selection box (computed from start/current) */
  y: number;
  /** Width of the selection box */
  width: number;
  /** Height of the selection box */
  height: number;
}

/**
 * Renders a dashed blue rectangle overlay to indicate drag-selection area.
 * Only visible while the user is actively dragging in select mode on empty canvas area.
 */
const SelectionBox: React.FC<SelectionBoxProps> = ({ visible, x, y, width, height }) => {
  if (!visible || (width < 2 && height < 2)) return null;

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.08)"
      stroke="#3b82f6"
      strokeWidth={1}
      dash={[6, 3]}
      listening={false}
    />
  );
};

export default SelectionBox;
