import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  productId: Joi.string().required(),
  message: Joi.string().required(),
  parentId: Joi.string().optional()
});

export const reactMessageSchema = Joi.object({
  productId: Joi.string().required(),
  messageId: Joi.string().required(),
  reaction: Joi.string().optional()
});
