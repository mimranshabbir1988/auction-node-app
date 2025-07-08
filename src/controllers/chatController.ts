import { Request, Response } from "express";
import Chat from "../models/Chat";
import Reaction from '../models/Reaction';
import { sendMessageSchema } from '../validators/chatValidator';
import { getIO } from '../socket/socket';
import { success, error as errorResponse } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { error, value } = sendMessageSchema.validate(req.body);
    if (error) {
      // Remove quotes from Joi error message
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({ message });
    }
    const { productId, message, parentId } = value;
    // Use a properly typed user property on Request for type safety
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', StatusCodes.UNAUTHORIZED);
    }
    const chat = new Chat({
      productId,
      userId,
      message,
      parentId,
      createdAt: new Date()
    });
    await chat.save();
    getIO().to(productId).emit('newMessage', chat);
    return success(res, chat, 'Message sent', StatusCodes.CREATED);
  } catch (err) {
    return errorResponse(res, 'Server error', StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};

export const reactMessage = async (req: Request, res: Response) => {
  try {
    const { productId, messageId, reaction } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', StatusCodes.UNAUTHORIZED);
    }
    // Save reaction to DB (upsert: one reaction per user per message)
    await Reaction.findOneAndUpdate(
      { productId, messageId, userId },
      { reaction, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    getIO().to(productId).emit('messageReacted', { messageId, reaction, userId });
    return success(res, { messageId, reaction }, 'Reaction sent');
  } catch (err) {
    return errorResponse(res, 'Server error', StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};