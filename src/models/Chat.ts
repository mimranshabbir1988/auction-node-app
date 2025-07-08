import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChat extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  createdAt: Date;
  parentId?: Types.ObjectId;
}

const ChatSchema = new Schema<IChat>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  parentId: { type: Schema.Types.ObjectId, ref: 'Chat' }
},{ timestamps: true });

const Chat = mongoose.model<IChat>('Chat', ChatSchema);
export default Chat;