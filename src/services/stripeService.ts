import env from '../config/envConfig';
import Stripe from 'stripe';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

const stripeService = {
  createCustomer: async ({ name, email }: { name: string; email: string }) => {
    return await stripe.customers.create({ name, email });
  },
  createProduct: async ({ name, price }: { name: string; price: number }) => {
    const product = await stripe.products.create({ name });
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'usd',
    });
    return { product, price: priceObj };
  },
  createCheckoutSession: async (params: any) => {
    return await stripe.checkout.sessions.create(params);
  }
};

export default stripeService;