import { Request, Response } from "express";
import Reaction from "../models/Reaction";
import { success, error as errorResponse } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export const getReactionsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return errorResponse(res, 'Product ID is required', StatusCodes.BAD_REQUEST);
    }
    const reactions = await Reaction.find({ productId }).populate('userId');
    return success(res, reactions, 'Reactions fetched');
  } catch (err) {
    return errorResponse(res, 'Server error', StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};
