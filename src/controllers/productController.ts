import { Request, Response } from 'express';
import Product from '../models/Product';
import stripeService from '../services/stripeService';
import { createProductSchema } from '../validators/productValidator';
import env from '../config/envConfig';
import Chat from '../models/Chat';
import { success, error as errorResponse } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

// List all products
export const listProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('userId');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list products' });
  }
};

// Create Product (DB + Stripe)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      // Remove quotes from Joi error message
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({ error: message });
    }
    const { name, price, type, description, lastBidTime } = value;
    // Create product and price on Stripe
    const { product: stripeProduct, price: stripePrice } = await stripeService.createProduct({ name, price });
    // Save product in DB
    const product = new Product({
      name,
      price,
      type,
      description,
      lastBidTime,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      userId: (req as any).user.userId // set creator
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Buyer: Buy Product (stub, to be implemented)
export const buyProduct = async (req: Request, res: Response) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.type !== 'product') {
    return res.status(400).json({ error: 'This product is not available for purchase' });
  }

  const session = {
    success_url: env.FRONTEND_BASE_URL,
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
  }
  const stripeSession = await stripeService.createCheckoutSession(session);
  res.json({ url: stripeSession.url });
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('userId');
    if (!product) {
      return errorResponse(res, 'Product not found', StatusCodes.NOT_FOUND);
    }
    return success(res, product, 'Product fetched');
  } catch (err) {
    return errorResponse(res, 'Server error', StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};

// Get all products by user
export const getProductsByUser = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ userId: req.params.userId });
    return success(res, products, 'Products fetched');
  } catch (err) {
    return errorResponse(res, 'Server error', StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};

// Get all messages for a single product
export const getProductMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Chat.find({ productId: req.params.id }).populate('userId').sort({ createdAt: 1 });
    return success(res, messages, 'Messages fetched');
  } catch (err) {
    return errorResponse(res, 'Server error', StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};