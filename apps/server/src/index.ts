import express from 'express';
import cors from 'cors';
import { setupWebSocketServer } from './websocket/wsServer';
import runMigrations from './db/runMigrations';
import roomRoutes from './modules/room/room.routes';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', roomRoutes);

async function start() {
  await runMigrations();
  
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  setupWebSocketServer(server);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
