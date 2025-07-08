import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  type: Joi.string().valid('product', 'bid').default('product'),
  description: Joi.string().optional(),
  lastBidTime: Joi.when('type', {
    is: 'bid',
    then: Joi.date().required(),
    otherwise: Joi.forbidden()
  })
});
