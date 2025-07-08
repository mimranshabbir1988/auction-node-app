import { Request, Response } from 'express';
import User from '../models/User';
import { stripe } from '../services/stripeService';
import { StatusCodes } from 'http-status-codes';

// Save a Stripe payment method for a user (from Stripe Elements token)
export const savePaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { paymentMethodId } = req.body;
    if (!userId || !paymentMethodId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing user or payment method' });
    }
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User or Stripe customer not found' });
    }
    // Attach payment method to Stripe customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: user.stripeCustomerId });
    // Set as default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    // Save payment method ID in DB
    user.stripePaymentMethodId = paymentMethodId;
    await user.save();
    return res.status(StatusCodes.OK).json({ message: 'Payment method saved' });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: errorMsg });
  }
};
