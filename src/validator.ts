import Joi from 'joi';
import { OpenAIRequest } from './interface';
import { Context } from 'koa';

const roleSchema = Joi.string().equal('user', 'assistant', 'system', 'developer', 'tool').required();
const commonMessageContentSchema = Joi.string().required().allow('');
const imageMessageContentSchema = Joi.array().items(
  Joi.object({
    type: Joi.string().valid('text', 'image_url').required(),
    text: Joi.when('type', {
      is: 'text',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    image_url: Joi.when('type', {
      is: 'image_url',
      then: Joi.object({
        url: Joi.string().required()
      }).required(),
      otherwise: Joi.forbidden()
    })
  })
);

const messageSchema = Joi.object({
  role: roleSchema,
  content: Joi.alternatives().try(commonMessageContentSchema, imageMessageContentSchema),
});

const schema = Joi.object<OpenAIRequest>({
  stream: Joi.boolean().default(false).optional(),
  model: Joi.string().required(),
  system: Joi.string().optional(),
  temperature: Joi.number().optional(),
  messages: Joi.array().items(messageSchema).required(),
  response_format: Joi.object({
    type: Joi.string().equal('json_object', 'json_schema', 'text').required(),
    schema: Joi.object().optional(),
  }).optional(),
}).unknown(true);

export function validateRequest(ctx: Context) {
  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    throw new Error(message);
  }

  return value;
}
