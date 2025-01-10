import Joi from 'joi';
import { OpenAIRequest } from './interface';
import { Context } from 'koa';

const roleSchema = Joi.string().equal('user', 'assistant', 'system', 'developer', 'tool').required();

const schema = Joi.object<OpenAIRequest>({
  stream: Joi.boolean().default(false).optional(),
  model: Joi.string().required(),
  system: Joi.string().optional(),
  temperature: Joi.number().optional(),
  messages: Joi.array().items(
    Joi.object({
      role: roleSchema,
      content: Joi.string().required().allow(''),
    })
  ).required(),
  response_format: Joi.object({
    type: Joi.string().equal('json_object', 'json_schema', 'text').required(),
    schema: Joi.object().optional(),
  }).optional(),
});

export function validateRequest(ctx: Context) {
  const { error, value } = schema.validate(ctx.request.body);

  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    throw new Error(message);
  }

  return value;
}
