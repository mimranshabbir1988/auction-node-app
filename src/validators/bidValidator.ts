import Joi from 'joi';

export const placeBidSchema = Joi.object({
  productId: Joi.string().required(),
  amount: Joi.number().positive().required()
});
