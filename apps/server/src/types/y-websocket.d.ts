import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

declare module 'y-websocket/bin/utils' {
  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void;
}
