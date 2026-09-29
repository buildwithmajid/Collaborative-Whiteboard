import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';

/**
 * Sets up a Yjs UndoManager scoped to the local client's origin only.
 * This ensures that undo/redo for User A does NOT affect changes made by User B.
 *
 * The `origin` passed to ydoc.transact() must match one of the trackedOrigins
 * for the UndoManager to track that transaction.
 */
export function useUndoRedo(ydoc: Y.Doc) {
  // Stable local origin — each browser tab gets its own Y.Doc clientID
  const localOrigin = useMemo(() => `local-${ydoc.clientID}`, [ydoc]);

  const undoManager = useMemo(() => {
    const yObjects = ydoc.getMap('objects');
    const um = new Y.UndoManager(yObjects, {
      trackedOrigins: new Set([localOrigin]),
    });
    return um;
  }, [ydoc, localOrigin]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const updateState = () => {
      setCanUndo(undoManager.undoStack.length > 0);
      setCanRedo(undoManager.redoStack.length > 0);
    };

    undoManager.on('stack-item-added', updateState);
    undoManager.on('stack-item-popped', updateState);
    // Also update on stack-cleared for edge cases
    undoManager.on('stack-cleared', updateState);

    return () => {
      undoManager.off('stack-item-added', updateState);
      undoManager.off('stack-item-popped', updateState);
      undoManager.off('stack-cleared', updateState);
    };
  }, [undoManager]);

  const undo = useCallback(() => {
    if (undoManager.undoStack.length > 0) {
      undoManager.undo();
    }
  }, [undoManager]);

  const redo = useCallback(() => {
    if (undoManager.redoStack.length > 0) {
      undoManager.redo();
    }
  }, [undoManager]);

  // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Y / Ctrl+Shift+Z = redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        // Ctrl+Y or Ctrl+Shift+Z
        // Guard against double-triggering: Ctrl+Shift+Z matches both branches
        // when key is 'z', so it's handled by the first condition that matches
        if (e.key === 'y' || e.shiftKey) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return { undo, redo, canUndo, canRedo, localOrigin };
}
