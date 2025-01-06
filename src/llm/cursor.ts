import { calcHex, genUUID } from '../core/basic.js';
import { getConfig } from '../config.js';
import protobuf from 'protobufjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { type Root } from 'protobufjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const root = protobuf.loadSync(join(__dirname, 'message.proto'));

const defaultChecksum = getConfig('CURSOR_CHECKSUM');

interface OpenAIChatMessage {
  role: string;
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIChatMessage[];
  stream: boolean;
}

interface CursorUserChatMessage {
  messageId: string;
  role: number;
  content: string;
}

interface CursorChatMessages {
  messages: CursorUserChatMessage[];
  instructions: { instruction: string };
  projectPath: string;
  model: { name: string; empty: string };
  summary: string;
  requestId: string;
  conversationId: string;
}

interface CursorTokenPayload {
  time: string;
  [key: string]: unknown;
}

export async function fetchCursor(cookie: string, data: OpenAIRequest) {
  const url = getConfig('CURSOR_URL');

  const checksum = genChecksum(cookie);


  const protoBytes = await convertRequest(data);

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${cookie}`,
      'content-type': 'application/connect+proto',
      'connect-accept-encoding': 'gzip,br',
      'connect-protocol-version': '1',
      'user-agent': 'connect-es/1.4.0',
      'x-cursor-checksum': checksum,
      'x-cursor-client-version': '0.42.3',
      'x-cursor-timezone': 'Asia/Shanghai',
      'host': 'api2.cursor.sh'
    },
    // Must be Uint32Array
    body: protoBytes,
  };

  console.log(options.headers);

  const res = await fetch(url, options);

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Reader not found');
  }

  const chunks: ArrayBufferLike[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log('response', bytesToString(value));
    chunks.push(value);
  }
  return;
}

async function convertRequest(request: OpenAIRequest) {
  const { messages, model } = request;
  const formattedMessages = messages.map((message) => ({
    messageId: genUUID(),
    role: message.role === 'user' ? 1 : 2,
    content: message.content,
  }));

  const cursorMessages: CursorChatMessages = {
    messages: formattedMessages,
    instructions: { instruction: '' },
    projectPath: '/path/to/project',
    model: { name: model.slice(7), empty: '' },
    summary: '',
    requestId: genUUID(),
    conversationId: genUUID(),
  };

  const ChatMessage = (root as Root).lookupType('ChatMessage');

  const errMsg = ChatMessage.verify(cursorMessages);
  if (errMsg) {
    throw new Error(errMsg);
  }

  const protoBytes = ChatMessage.encode(cursorMessages).finish();

  const header = int32ToBytes(0, protoBytes.byteLength);

  const buffer = Buffer.concat([header, protoBytes]);

  return Uint32Array.from(buffer);
}

/**
 * 生成checksum, 该key为设备ID, 如果不提供则自动生成一个
 * @param token cookie 网页端登录的WorkosCursorSessionToken
 * @returns 
 */
export function genChecksum(token: string): string {
  let checksum = defaultChecksum;
  if (!checksum) {
    const salt = token.split('.');

    const calc = (data: Buffer) => {
        let t = 165;
        for (let i = 0; i < data.length; i++) {
            data[i] = (data[i] ^ t) + i;
            t = data[i];
        }
    };

    const json = Buffer.from(salt[1], 'base64').toString('utf-8');
    const obj = JSON.parse(json) as CursorTokenPayload;
    const timestamp = Math.floor(new Date(parseInt(obj.time, 10)).getTime() / 1000);
    const timestampBuffer = Buffer.alloc(6);
    timestampBuffer.writeUIntBE(timestamp, 0, 6);

    calc(timestampBuffer);

    const hex1 = calcHex(salt[1]);
    const hex2 = calcHex(token);
    checksum = `${timestampBuffer.toString('hex')}${hex1}/${hex2}`;
  }
  return checksum;
}

function int32ToBytes(magic: number, num: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(num, 0);
  const result = Buffer.concat([Buffer.from([magic]), buffer]);
  return result;
}

export function bytesToInt32(buffer: Buffer) {
  if (buffer.length !== 4) {
    throw new Error('Buffer must be exactly 4 bytes long');
  }
  return buffer.readUInt32BE(0);
}

export function bytesToString(buffer: ArrayBufferLike, offset = 5) {
  const buf = Buffer.from(buffer.slice(offset));
  return buf.toString('utf-8');
}
