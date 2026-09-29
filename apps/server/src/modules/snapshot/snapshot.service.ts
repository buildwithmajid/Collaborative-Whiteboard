import * as Y from 'yjs';
import { query } from '../../db/client';

export async function saveSnapshot(roomId: string, ydoc: Y.Doc): Promise<void> {
  const update = Y.encodeStateAsUpdate(ydoc);
  const snapshotBuffer = Buffer.from(update);

  const versionResult = await query(
    'SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM board_snapshots WHERE room_id = $1',
    [roomId]
  );
  const nextVersion = versionResult.rows[0].next_version;

  await query(
    `INSERT INTO board_snapshots (room_id, snapshot_data, version_number, snapshot_type, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [roomId, snapshotBuffer, nextVersion, 'auto']
  );
}

export async function loadLatestSnapshot(roomId: string): Promise<Uint8Array | null> {
  const result = await query(
    `SELECT snapshot_data FROM board_snapshots 
     WHERE room_id = $1 
     ORDER BY version_number DESC 
     LIMIT 1`,
    [roomId]
  );

  if (result.rows.length === 0) return null;

  const buffer = result.rows[0].snapshot_data;
  return new Uint8Array(buffer);
}
