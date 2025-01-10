export interface OpenAIImageMessageContent {
  type: 'image_url' | 'text';
  image_url?: {
    url: string;
  };
  text?: string;
}

export interface OpenAIChatMessage {
  role: string;
  content: string | OpenAIImageMessageContent[];
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIChatMessage[];
  system?: string;
  stream?: boolean;
  temperature?: number;
  response_format?: {
    type: 'json_object' | 'json_schema' | 'text';
    schema?: object;
  };
}
