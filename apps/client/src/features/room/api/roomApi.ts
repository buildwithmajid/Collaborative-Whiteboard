import { apiRequest } from '../../../lib/apiClient';

export interface Room {
  id: string;
  name: string;
  created_at: string;
}

export async function createRoom(name: string): Promise<string> {
  const { roomId } = await apiRequest<{ roomId: string }>('/rooms', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return roomId;
}

export async function getRoom(roomId: string): Promise<Room> {
  return apiRequest<Room>(`/rooms/${encodeURIComponent(roomId)}`);
}
