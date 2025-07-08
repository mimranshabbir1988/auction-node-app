import express from 'express';
import { savePaymentMethod } from '../controllers/paymentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/save', authenticate, savePaymentMethod);

export default router;
