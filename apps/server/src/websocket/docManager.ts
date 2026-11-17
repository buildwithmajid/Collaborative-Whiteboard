import * as Y from 'yjs';
import { docs, setPersistence } from 'y-websocket/bin/utils';
import { env } from '../config/env';
import { loadLatestSnapshot, saveSnapshot } from '../modules/snapshot/snapshot.service';

/**
 * Persistence for the Y.Docs that y-websocket keeps in memory.
 *
 * y-websocket owns the doc lifecycle (one WSSharedDoc per room, created on first
 * connection and destroyed after the last one leaves). We hook into it via
 * `setPersistence` so snapshots are taken from the SAME doc clients edit:
 *  - bindState:  restore the latest snapshot, then debounce-save on every update
 *                (with a max wait so continuous editing still gets saved — ERD B.4)
 *  - writeState: flush a final save when the last client disconnects
 */

const SNAPSHOT_RESTORE_ORIGIN = 'snapshot-restore';

interface RoomPersistenceState {
  debounceTimer: NodeJS.Timeout | null;
  firstPendingAt: number | null;
  /** False if restoring failed — saving then would overwrite the real board with a partial one. */
  canSave: boolean;
}

const rooms = new Map<string, RoomPersistenceState>();
/** Saves still in flight per room, so a quick reconnect waits for them before restoring. */
const pendingWrites = new Map<string, Promise<void>>();

async function flush(roomId: string, doc: Y.Doc): Promise<void> {
  const state = rooms.get(roomId);
  if (state) {
    if (state.debounceTimer) clearTimeout(state.debounceTimer);
    state.debounceTimer = null;
    state.firstPendingAt = null;
    if (!state.canSave) return;
  }

  const previous = pendingWrites.get(roomId) ?? Promise.resolve();
  const write = previous.then(async () => {
    try {
      await saveSnapshot(roomId, doc);
      console.log(`Saved snapshot for room: ${roomId}`);
    } catch (err) {
      console.error(`Failed to save snapshot for room ${roomId}:`, err);
    }
  });
  pendingWrites.set(roomId, write);
  await write;
  if (pendingWrites.get(roomId) === write) pendingWrites.delete(roomId);
}

function scheduleSave(roomId: string, doc: Y.Doc) {
  const state = rooms.get(roomId);
  if (!state || !state.canSave) return;

  const now = Date.now();
  state.firstPendingAt ??= now;
  if (state.debounceTimer) clearTimeout(state.debounceTimer);

  const untilMaxWait = state.firstPendingAt + env.SNAPSHOT_MAX_WAIT_MS - now;
  const delay = Math.max(0, Math.min(env.SNAPSHOT_DEBOUNCE_MS, untilMaxWait));
  state.debounceTimer = setTimeout(() => {
    void flush(roomId, doc);
  }, delay);
}

async function bindState(roomId: string, doc: Y.Doc): Promise<void> {
  const state: RoomPersistenceState = { debounceTimer: null, firstPendingAt: null, canSave: true };
  rooms.set(roomId, state);

  // Edits that arrive while the snapshot is still loading must be saved too.
  doc.on('update', (_update: Uint8Array, origin: unknown) => {
    if (origin === SNAPSHOT_RESTORE_ORIGIN) return;
    scheduleSave(roomId, doc);
  });

  try {
    await pendingWrites.get(roomId);
    const snapshot = await loadLatestSnapshot(roomId);
    if (snapshot) {
      Y.applyUpdate(doc, snapshot, SNAPSHOT_RESTORE_ORIGIN);
      console.log(`Restored snapshot for room: ${roomId}`);
    }
  } catch (err) {
    state.canSave = false;
    if (state.debounceTimer) clearTimeout(state.debounceTimer);
    console.error(`Failed to restore snapshot for room ${roomId}; saving disabled until reload:`, err);
  }
}

async function writeState(roomId: string, doc: Y.Doc): Promise<void> {
  const state = rooms.get(roomId);
  // Skip the final write if nothing changed since the last save.
  const hasUnsavedChanges = state?.firstPendingAt != null;
  if (hasUnsavedChanges) {
    await flush(roomId, doc);
  }
  rooms.delete(roomId);
}

export function setupPersistence() {
  setPersistence({ bindState, writeState });
}

/** Save every room with unsaved changes — call before the process exits. */
export async function flushAll(): Promise<void> {
  const saves: Promise<void>[] = [];
  rooms.forEach((state, roomId) => {
    const doc = docs.get(roomId);
    if (doc && state.firstPendingAt != null) saves.push(flush(roomId, doc));
  });
  await Promise.all(saves);
  await Promise.all(pendingWrites.values());
}
