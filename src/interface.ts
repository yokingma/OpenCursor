export interface OpenAIChatMessage {
  role: string;
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIChatMessage[];
  system?: string;
  stream?: boolean;
  response_format?: {
    type: 'json_object' | 'json_schema' | 'text';
    schema?: object;
  };
}
