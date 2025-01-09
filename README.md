# OpenCursor

OpenCursor 是基于 Cursor AI 编辑器接口实现的 OpenAI 兼容的 API，支持流式响应。
> 本项目仅为研究学习目的，不得用于任何商业用途。

仓库地址：[GitHub](https://github.com/yokingma/OpenCursor)  [CNB](https://cnb.cool/aigc/OpenCursor)

## Docker

```sh
docker pull docker.cnb.cool/aigc/opencursor:latest
```

## 示例

假设项目运行在本地(127.0.0.1)，端口为 `3000` (默认)，可以在.env中配置。

### OpenAI 请求示例

示例为TS语言，其他语言或者详细使用请参考 [OpenAI 官方API文档](https://platform.openai.com/docs/api-reference/introduction) 和 [OpenAI 官方库](https://platform.openai.com/docs/libraries)

```sh
npm install openai
```

#### 普通响应

```ts
import OpenAI from 'openai';
// API_KEY 为 Cursor 网页端登录的 WorkosCursorSessionToken
const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: 'http://127.0.0.1:3000/v1',
});

async function main() {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-4o',
  });
}

main();
```

#### 流式响应

```ts
// ...
async function main() {
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Say this is a test' }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

main();
```

## 开发

```sh
npm install
npm run dev
```
