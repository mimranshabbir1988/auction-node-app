import mongoose from 'mongoose';
import env from './envConfig';

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ MongoDB connection failed:', errorMsg);
        throw err;
    }
};
export default connectDB;