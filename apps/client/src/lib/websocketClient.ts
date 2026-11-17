function readBaseUrl(): string {
  const value = import.meta.env.VITE_WS_URL;
  if (!value) {
    throw new Error('VITE_WS_URL is not set (see apps/client/.env.example)');
  }
  return value.replace(/\/+$/, '');
}

/** Base URL for y-websocket; the provider appends `/<roomId>` itself. */
export const ROOM_WS_URL = `${readBaseUrl()}/room`;
