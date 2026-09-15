import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),

  mongodbUri: required('MONGODB_URI'),
  mongodbDatabase: required('MONGODB_DATABASE'),

  openaiApiKey: required('OPENAI_API_KEY'),

  openaiChatModel:
    process.env.OPENAI_CHAT_MODEL ?? 'gpt-5',

  openaiEmbeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL ??
    'text-embedding-3-small',

  vectorIndexName:
    process.env.VECTOR_INDEX_NAME ??
    'vector_index',

  corsOrigin:
    process.env.CORS_ORIGIN ??
    'http://localhost:4200'
};