import { Router } from 'express';
import { handleCreateRoom, handleGetRoom } from './room.controller';

const router = Router();

router.post('/rooms', handleCreateRoom);
router.get('/rooms/:id', handleGetRoom);

export default router;
