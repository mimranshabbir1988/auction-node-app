import { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({ status: 'error', message });
    }
    req.body = value;
    next();
  };
};