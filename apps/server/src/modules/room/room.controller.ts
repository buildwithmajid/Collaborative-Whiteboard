import type { Request, Response } from 'express';
import { createRoom, getRoomById } from './room.service';

export async function handleCreateRoom(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Room name required' });
    }
    const roomId = await createRoom(name);
    res.json({ roomId });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
}

export async function handleGetRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const room = await getRoomById(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
}
