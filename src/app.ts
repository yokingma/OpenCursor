import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from '@koa/bodyparser';
import { fetchCursor } from './llm/cursor.js';
import { getConfig } from './config.js';
import Router from '@koa/router';

const app = new Koa();
const router = new Router();

app.use(cors({
  origin: '*'
}));

app.use(bodyParser());

app.use(router.routes());

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    ctx.res.statusCode = 422;
    ctx.body = err;
  }
});

router.get('/cursor', async (ctx) => {
  const data = {
    stream: true,
    model: 'cursor/gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'hi ~'
      }
    ]
  };
  fetchCursor(getConfig('CURSOR_COOKIE'), data);
  ctx.body = 'done';
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
