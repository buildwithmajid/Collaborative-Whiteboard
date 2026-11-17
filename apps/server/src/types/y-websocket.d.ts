// Ambient declaration (no top-level imports, otherwise this would become a module augmentation).
declare module 'y-websocket/bin/utils' {
  type YDoc = import('yjs').Doc;

  export function setupWSConnection(
    conn: import('ws').WebSocket,
    req: import('http').IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void;

  export interface Persistence {
    bindState: (docName: string, doc: YDoc) => void | Promise<void>;
    writeState: (docName: string, doc: YDoc) => Promise<unknown>;
  }

  export function setPersistence(persistence: Persistence | null): void;

  /** Docs currently held in memory by y-websocket, keyed by room name. */
  export const docs: Map<string, YDoc>;
}
