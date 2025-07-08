import { Schema, model, Document } from 'mongoose';

export interface ReactionDocument extends Document {
  productId: string;
  messageId: string;
  userId: string;
  reaction: ReactionType;
  createdAt: Date;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'sad' | 'angry';

const reactionSchema = new Schema<ReactionDocument>({
  productId: { type: String, required: true, index: true },
  messageId: { type: String, required: true },
  userId: { type: String, required: true },
  reaction: {
    type: String,
    enum: ['like', 'love', 'laugh', 'sad', 'angry'],
    default: 'like',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
});

export default model<ReactionDocument>('Reaction', reactionSchema);
