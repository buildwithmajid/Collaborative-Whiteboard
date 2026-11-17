import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import type { Server } from 'http';
import { setupPersistence } from './docManager';
import { getRoomById } from '../modules/room/room.service';

export function setupWebSocketServer(server: Server) {
  setupPersistence();
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (conn, req) => {
    const url = req.url || '';
    const match = url.match(/^\/room\/([^?]+)/);

    if (!match) {
      conn.close(4000, 'Room ID required');
      return;
    }

    const roomId = match[1];
    // Register y-websocket's handlers synchronously so the client's first sync message isn't dropped.
    // The snapshot is restored by the persistence layer (see docManager.ts).
    setupWSConnection(conn, req, { docName: roomId, gc: true });
  });

  server.on('upgrade', async (request, socket, head) => {
    const url = request.url || '';
    const match = url.match(/^\/room\/([^?]+)/);

    if (!match) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    const roomId = match[1];

    try {
      const room = await getRoomById(roomId);

      if (!room) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }
    } catch (err) {
      console.error(`Failed to validate room ${roomId}:`, err);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  return wss;
}
