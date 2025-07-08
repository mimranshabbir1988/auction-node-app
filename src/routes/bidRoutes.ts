import express from 'express';
import { placeBid } from '../controllers/bidController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authenticate, placeBid);

export default router;
