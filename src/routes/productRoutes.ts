import express from 'express';
import { listProducts, createProduct, buyProduct, getProductById, getProductsByUser, getProductMessages } from '../controllers/productController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authenticate, createProduct);
router.get('/', listProducts);
router.post('/buy', authenticate, buyProduct);
router.get('/:id', getProductById);
router.get('/user/:userId', getProductsByUser);
router.get('/messages/:id', getProductMessages);

export default router;
