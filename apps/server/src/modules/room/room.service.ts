import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/client';

export async function createRoom(name: string): Promise<string> {
  const roomId = uuidv4();
  await query(
    'INSERT INTO rooms (id, name) VALUES ($1, $2)',
    [roomId, name]
  );
  return roomId;
}

export async function getRoomById(roomId: string) {
  const result = await query('SELECT * FROM rooms WHERE id = $1', [roomId]);
  return result.rows[0] || null;
}

export async function createUser(displayName: string, avatarColor: string) {
  const userId = uuidv4();
  await query(
    'INSERT INTO users (id, display_name, avatar_color, is_guest) VALUES ($1, $2, $3, true)',
    [userId, displayName, avatarColor]
  );
  return userId;
}

export async function addRoomMember(roomId: string, userId: string, role = 'editor') {
  await query(
    'INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [roomId, userId, role]
  );
}
