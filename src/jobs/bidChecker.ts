import Product from '../models/Product';
import Bid from '../models/Bid';
import User from '../models/User';
import { stripe } from '../services/stripeService';

// Check for ended bid products and select the top (latest) bidder
export const checkBids = async () => {
  const now = new Date();
  const products = await Product.find({
    type: 'bid',
    lastBidTime: { $lte: now }
  });

  for (const product of products) {
    const topBid = await Bid.findOne({ productId: product._id })
      .sort({ amount: -1, createdAt: -1 });
    if (topBid) {
      // Fetch bidder and seller using User model
      const bidder = await User.findById(topBid.userId);
      const seller = await User.findById(product.userId);
      if (!bidder || !seller) {
        console.log('Bidder or seller not found');
        continue;
      }
      // Check if bidder has a payment method
      if (!bidder.stripeCustomerId || !bidder.stripePaymentMethodId) {
        console.log('Bidder missing Stripe info');
        continue;
      }
      // Check if seller has a Stripe account (for payout)
      if (!seller.stripeCustomerId) {
        console.log('Seller missing Stripe info');
        continue;
      }
      // Charge the bidder and transfer to seller
      try {
       
        await stripe.paymentIntents.create({
          amount: Math.round(topBid.amount * 100),
          currency: 'usd',
          customer: bidder.stripeCustomerId,
          payment_method: bidder.stripePaymentMethodId,
          off_session: true,
          confirm: true,
          transfer_data: {
            // This requires seller to be a Stripe Connect account
            destination: seller.stripeCustomerId,
          },
        });
        // Mark product as bidEnded
        product.bidEnded = true;
        await product.save();
        console.log(`Transferred $${topBid.amount} from bidder to seller for product ${product._id}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.log('Stripe payment failed:', errorMsg);
      }
    } else {
      console.log(`Product ${product._id} ended. No bids placed.`);
    }
  }
};