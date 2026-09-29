import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import type { WhiteboardObject, ShapeType } from '@whiteboard/shared';

export function useCanvasObjects(ydoc: Y.Doc) {
  const [objects, setObjects] = useState<Map<string, WhiteboardObject>>(new Map());

  useEffect(() => {
    const yObjects = ydoc.getMap<Y.Map<unknown>>('objects');

    const loadObjects = () => {
      const objMap = new Map<string, WhiteboardObject>();
      yObjects.forEach((yMap, key) => {
        const obj: WhiteboardObject = {
          id: yMap.get('id') as string,
          type: yMap.get('type') as ShapeType,
          x: yMap.get('x') as number,
          y: yMap.get('y') as number,
          width: yMap.get('width') as number | undefined,
          height: yMap.get('height') as number | undefined,
          fill: yMap.get('fill') as string,
          stroke: yMap.get('stroke') as string,
          strokeWidth: yMap.get('strokeWidth') as number,
          rotation: yMap.get('rotation') as number,
          zIndex: yMap.get('zIndex') as number,
          createdBy: yMap.get('createdBy') as string,
          lastModifiedBy: yMap.get('lastModifiedBy') as string,
          updatedAt: yMap.get('updatedAt') as number,
        };
        objMap.set(key, obj);
      });
      setObjects(objMap);
    };

    loadObjects();

    const observer = () => {
      loadObjects();
    };

    yObjects.observe(observer);

    return () => {
      yObjects.unobserve(observer);
    };
  }, [ydoc]);

  const updateObject = (id: string, obj: WhiteboardObject) => {
    const yObjects = ydoc.getMap('objects');
    const yMap = new Y.Map();
    Object.entries(obj).forEach(([key, value]) => {
      yMap.set(key, value);
    });
    yObjects.set(id, yMap);
  };

  const addObject = (obj: WhiteboardObject) => {
    updateObject(obj.id, obj);
  };

  return { objects, addObject, updateObject };
}
