import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { error as errorResponse } from '../utils/response';

export function validateBody(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return errorResponse(res, message, 400);
    }
    req.body = value;
    next();
  };
}
