/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST server, e.g. http://localhost:3001 */
  readonly VITE_API_URL?: string;
  /** Base URL of the WebSocket server, e.g. ws://localhost:3001 */
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
