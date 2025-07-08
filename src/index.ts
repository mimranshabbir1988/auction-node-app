import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import bidRoutes from "./routes/bidRoutes";
import chatRoutes from "./routes/chatRoutes";
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler } from "./middlewares/errorMiddleware";
import { setupSocket } from './socket/socket';
import connectDB from './config/db';

import './jobs/scheduler';
import 'express-async-errors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [process.env.FRONTEND_BASE_URL || 'http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(helmet());

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.get(('/'), (_, res) => res.send('Server is running'))
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);

// Error handler
app.use(errorHandler);

// Connect DB and Start Server
connectDB().then(() => {
  const server = http.createServer(app);
  setupSocket(server);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io enabled`);
  });
}).catch((_err: unknown) => {
  process.exit(1);
});
