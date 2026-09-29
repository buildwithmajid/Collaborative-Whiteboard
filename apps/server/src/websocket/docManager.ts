import * as Y from 'yjs';
import { loadLatestSnapshot, saveSnapshot } from '../modules/snapshot/snapshot.service';

const docs = new Map<string, Y.Doc>();
const saveTimers = new Map<string, NodeJS.Timeout>();

export async function getDoc(roomId: string): Promise<Y.Doc> {
  let doc = docs.get(roomId);
  
  if (!doc) {
    doc = new Y.Doc();
    docs.set(roomId, doc);

    const snapshot = await loadLatestSnapshot(roomId);
    if (snapshot) {
      Y.applyUpdate(doc, snapshot);
      console.log(`Restored snapshot for room: ${roomId}`);
    }

    setupAutoSave(roomId, doc);
  }
  
  return doc;
}

function setupAutoSave(roomId: string, doc: Y.Doc) {
  doc.on('update', () => {
    const existingTimer = saveTimers.get(roomId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      try {
        await saveSnapshot(roomId, doc);
        console.log(`Auto-saved snapshot for room: ${roomId}`);
      } catch (err) {
        console.error(`Failed to save snapshot for room ${roomId}:`, err);
      }
    }, 5000);

    saveTimers.set(roomId, timer);
  });
}

export function removeDoc(roomId: string) {
  const timer = saveTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    saveTimers.delete(roomId);
  }
  docs.delete(roomId);
}
