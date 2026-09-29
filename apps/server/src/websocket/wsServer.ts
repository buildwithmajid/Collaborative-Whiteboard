import { WebSocketServer } from 'ws';
// @ts-ignore - y-websocket v1.5 doesn't ship types for bin/utils
import { setupWSConnection } from 'y-websocket/bin/utils';
import type { Server } from 'http';
import { getDoc } from './docManager';
import { getRoomById } from '../modules/room/room.service';

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', async (conn, req) => {
    const url = req.url || '';
    const match = url.match(/^\/room\/([^?]+)/);
    
    if (!match) {
      conn.close(4000, 'Room ID required');
      return;
    }

    const roomId = match[1];
    const room = await getRoomById(roomId);
    
    if (!room) {
      conn.close(4004, 'Room not found');
      return;
    }

    await getDoc(roomId);
    setupWSConnection(conn, req, { docName: roomId, gc: true });
  });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  return wss;
}
