import type { WhiteboardObject } from '@whiteboard/shared';

export type { WhiteboardObject };

export type ToolMode = 'select' | 'rectangle' | 'circle';

export interface CanvasState {
  objects: Map<string, WhiteboardObject>;
  selectedId: string | null;
  toolMode: ToolMode;
}

export interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
}
