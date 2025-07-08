import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string; // For storing default payment method
  role: string;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  stripeCustomerId: { type: String },
  stripePaymentMethodId: { type: String }, // Store payment method ID
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
},{ timestamps: true });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;