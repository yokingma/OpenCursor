import { Context, Next } from 'koa';

export function tokenMiddleware() {
  return async (ctx: Context, next: Next) => {
    const authorization = ctx.request.headers.authorization;

    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      ctx.res.statusCode = 401;
      ctx.body = 'Unauthorized';
      return;
    }

    ctx.state.token = token;

    await next();
  };
}