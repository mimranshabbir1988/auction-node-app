import { Request, Response } from 'express';
import { placeBidSchema } from '../validators/bidValidator';
import Product from '../models/Product';
import Bid from '../models/Bid';

export const placeBid = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = placeBidSchema.validate(req.body);
  if (error) {
    const message = error.details[0].message.replace(/"/g, '');
    res.status(400).json({ error: message });
    return;
  }
  const userId = (req as any).user.userId;
  const product = await Product.findById(value.productId);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  if (product.userId.toString() === userId) {
    res.status(403).json({ error: 'Owner cannot bid on their own product' });
    return;
  }
  if (product.lastBidTime && new Date() > new Date(product.lastBidTime)) {
    res.status(400).json({ error: 'This product is not available for bidding' });
    return;
  }
  const isAlreadyBid = await Bid.findOne({ userId, productId: product._id });
  if (isAlreadyBid) {
    res.status(400).json({ error: 'You have already placed a bid on this product' });
    return;
  }
  const bidAmount = req.body.amount;
  const lastBid = await Bid.findOne({ productId: product._id }).sort({ createdAt: -1 });
  if (bidAmount <= (lastBid?.amount || 0)) {
    res.status(400).json({ error: 'Bid must be higher than current bid' });
    return;
  }
  const bid = new Bid({
    userId,
    productId: product._id,
    amount: bidAmount
  });
  await bid.save();
  res.status(201).json({ message: 'Bid placed successfully', bid });
};