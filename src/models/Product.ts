import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  type: 'product' | 'bid';
  lastBidTime?: Date;
  stripeProductId?: string;
  stripePriceId?: string;
  description?: string;
  userId: Types.ObjectId;
  bidEnded?: boolean;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['product', 'bid'], required: true, default: 'product' },
  lastBidTime: { type: Date },
  stripeProductId: { type: String },
  stripePriceId: { type: String },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bidEnded: { type: Boolean, default: false },
},{ timestamps: true });

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;