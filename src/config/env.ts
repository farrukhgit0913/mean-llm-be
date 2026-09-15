import 'dotenv/config';

export const env = {
  ollamaUrl:
    process.env.OLLAMA_URL ??
    'http://localhost:11434',

  ollamaChatModel:
    process.env.OLLAMA_CHAT_MODEL ??
    'llama3.2',

  ollamaEmbeddingModel:
    process.env.OLLAMA_EMBEDDING_MODEL ??
    'nomic-embed-text',

  mongodbUri:
    process.env.MONGODB_URI ??
    'mongodb://127.0.0.1:27017',

  mongodbDatabase:
    process.env.MONGODB_DATABASE ??
    'mean_llm_rag',

  port:
    Number(process.env.PORT ?? 3000),

  corsOrigin:
    process.env.CORS_ORIGIN ??
    'http://localhost:4200'
};