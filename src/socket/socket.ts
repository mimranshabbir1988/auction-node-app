import { Server, Socket } from 'socket.io';
import http from 'http';
import env from '../config/envConfig';
import Product from '../models/Product';
import Chat from '../models/Chat';

interface ReactMessagePayload {
    productId: string;
    messageId: string;
    reaction: string;
    userId: string;
}

interface SendMessagePayload {
    productId: string;
    userId: string;
    message: string;
    parentId?: string;
}

let io: Server | null = null;

export function setupSocket(server: http.Server) {
    io = new Server(server, {
        cors: {
            origin: env.FRONTEND_BASE_URL,
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket: Socket) => {
        socket.on('joinProduct', (productId: string) => {
            socket.join(productId);
        });

        socket.on('reactMessage', async (payload: ReactMessagePayload) => {
            io?.to(payload.productId).emit('messageReacted', payload);
        });

        socket.on('sendMessage', async (payload: SendMessagePayload) => {
            const { productId, userId, message, parentId } = payload;
            const product = await Product.findById(productId);
            if (!product || (product.lastBidTime && new Date() > new Date(product.lastBidTime))) {
                socket.emit('error', 'Product chat is closed');
                return;
            }
            const chat = new Chat({ productId, userId, message, parentId });
            await chat.save();
            io?.to(productId).emit('newMessage', chat);
        });
    });
}

export function getIO(): Server {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
}