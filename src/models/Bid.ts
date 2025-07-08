import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBid extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const BidSchema = new Schema<IBid>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
},{timestamps: true});

const Bid = mongoose.model<IBid>('Bid', BidSchema);
export default Bid;