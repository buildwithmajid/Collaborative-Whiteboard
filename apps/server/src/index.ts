import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import { setupWebSocketServer } from './websocket/wsServer';
import { flushAll } from './websocket/docManager';
import runMigrations from './db/runMigrations';
import roomRoutes from './modules/room/room.routes';

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(express.json());
app.use('/api', roomRoutes);

async function start() {
  await runMigrations();
  
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  setupWebSocketServer(server);

  // Save unsaved boards before exiting so a restart doesn't drop the last few seconds of edits.
  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, saving boards...`);
    try {
      await flushAll();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
