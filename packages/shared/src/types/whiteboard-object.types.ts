export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'freehand';

export interface WhiteboardObject {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  zIndex: number;
  groupId?: string;
  createdBy: string;
  lastModifiedBy: string;
  updatedAt: number;
}
