import type { WhiteboardObject } from '@whiteboard/shared';

export function createRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  userId: string
): WhiteboardObject {
  return {
    id: `rect-${Date.now()}-${Math.random()}`,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    rotation: 0,
    zIndex: 0,
    createdBy: userId,
    lastModifiedBy: userId,
    updatedAt: Date.now(),
  };
}

export function createCircle(
  x: number,
  y: number,
  radius: number,
  userId: string
): WhiteboardObject {
  return {
    id: `circle-${Date.now()}-${Math.random()}`,
    type: 'circle',
    x,
    y,
    width: radius * 2,
    height: radius * 2,
    fill: '#ef4444',
    stroke: '#991b1b',
    strokeWidth: 2,
    rotation: 0,
    zIndex: 0,
    createdBy: userId,
    lastModifiedBy: userId,
    updatedAt: Date.now(),
  };
}
