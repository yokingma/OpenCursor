import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from '@koa/bodyparser';
import { fetchCursor } from './provider/cursor.js';
import Router from '@koa/router';
import { tokenMiddleware } from './middleware.js';
import { getConfig } from './config.js';
import { logger } from './logger.js';
import { validateRequest } from './validator.js';
const router = new Router({
  prefix: '/v1'
});

const app = new Koa();

const port = getConfig('PORT', '3000');

app.use(cors({
  origin: '*'
}));

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

router.use(tokenMiddleware());

// Error handler
router.use(async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    const message = (err as Error).message;
    logger.error(message);
    ctx.body = {
      message
    };
    ctx.res.statusCode = 422;
  }
});

router.post('/chat/completions', async (ctx) => {
  const data = validateRequest(ctx);

  const { model, messages, stream = false } = data;

  const token = ctx.state.token as string;

  if (!stream) {
    const response = await fetchCursor(token, { model, messages });
    ctx.body = response;
    return;
  }

  // stream response
  ctx.res.setHeader('Content-Type', 'text/event-stream');
  ctx.res.setHeader('Cache-Control', 'no-cache');
  ctx.res.setHeader('Connection', 'keep-alive');
  ctx.res.statusCode = 200;

  await fetchCursor(token, { model, messages }, (msg) => {
    const eventData = `data: ${JSON.stringify(msg)}\n\n`;
    ctx.res.write(eventData, 'utf-8');
  });
  ctx.res.write('data: [DONE]\n\n');
  ctx.res.end();
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
