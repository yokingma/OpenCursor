# OpenCursor

OpenCursor 是基于 Cursor AI 编辑器接口实现的 OpenAI 兼容的 API，支持流式响应。
> 本项目仅为研究学习目的，不得用于任何商业用途。

仓库地址：[GitHub](https://github.com/yokingma/OpenCursor)  [腾讯CNB](https://cnb.cool/aigc/OpenCursor)

## Docker

```sh
docker pull docker.cnb.cool/aigc/opencursor:latest
```

## 示例

假设项目运行在本地(127.0.0.1)，端口为 `3000` (默认)，可以在.env中配置。

BaseUrl 为 `http://127.0.0.1:3000/v1`

### 获取API_KEY

1. 打开 Cursor 网页端，并登录。
2. 打开开发者工具
3. 在 `Application`或者`应用` 标签下找到 Cookie `WorkosCursorSessionToken`
4. 复制 `WorkosCursorSessionToken` 值作为 `API_KEY`


### OpenAI 请求示例

请求支持普通消息体和图片模式消息体:

```ts
// 普通消息体
{
  //...
  "messages": [
    {
      "role": "user",
      "content": "Say this is a test" 
    }
  ],
  //...
}
// 图片传入式消息体，但是不支持读图，暂时不知道Cursor接口的传图参数是什么。
{
  //...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Say this is a test"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/image.png" 
          }
        }
      ]
    }
  ],

}
```

示例为TS语言，其他语言或者详细使用请参考 [OpenAI 官方API文档](https://platform.openai.com/docs/api-reference/introduction) 和 [OpenAI 官方库](https://platform.openai.com/docs/libraries)

#### 安装OpenAI库

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
