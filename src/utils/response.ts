import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function success(res: Response, data: any, message = 'Success', status = StatusCodes.OK) {
  return res.status(status).json({ status: 'success', message, data });
}

export function error(res: Response, message = 'Error', status = StatusCodes.BAD_REQUEST, data?: any) {
  return res.status(status).json({ status: 'error', message, data });
}
