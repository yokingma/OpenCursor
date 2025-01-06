import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from '@koa/bodyparser';
import { fetchCursor } from './provider/cursor.js';
import Router from '@koa/router';
import { tokenMiddleware } from './middleware.js';

const app = new Koa();
const router = new Router({
  prefix: '/v1'
});

app.use(cors({
  origin: '*'
}));

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    ctx.res.statusCode = 422;
    ctx.body = err;
  }
});

router.use(tokenMiddleware());

router.post('/chat/completions', async (ctx) => {
  const { model, messages } = ctx.request.body;

  if (!model || !messages) {
    ctx.body = {
      error: 'Invalid request',
      message: 'model and messages are required',
    };
    ctx.res.statusCode = 422;
    return;
  }

  // stream response
  ctx.res.setHeader('Content-Type', 'text/event-stream');
  ctx.res.setHeader('Cache-Control', 'no-cache');
  ctx.res.setHeader('Connection', 'keep-alive');
  ctx.res.statusCode = 200;

  const token = ctx.state.token as string;
  await fetchCursor(token, { model, messages }, (msg) => {
    const eventData = `data:${JSON.stringify({ data: msg })}\n\n`;
    ctx.res.write(eventData, 'utf-8');
  });
  ctx.res.end();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
