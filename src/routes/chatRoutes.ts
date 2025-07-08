import express from 'express';
import { validateBody } from '../middlewares/validate';
import { sendMessageSchema, reactMessageSchema } from '../validators/chatValidator';
import { sendMessage, reactMessage } from '../controllers/chatController';
import { authenticate } from '../middlewares/authMiddleware';
import { getReactionsByProduct } from '../controllers/reactionController';

const router = express.Router();

router.post('/', authenticate, validateBody(sendMessageSchema), sendMessage);
router.post('/react', authenticate, validateBody(reactMessageSchema), reactMessage);
router.get('/reactions/:productId', authenticate, getReactionsByProduct);

export default router;
