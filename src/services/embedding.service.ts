import { openai } from './openai.service.js';
import { env } from '../config/env.js';

export async function createEmbeddings(
  texts: string[]
): Promise<number[][]> {

  const response =
    await openai.embeddings.create({
      model: env.openaiEmbeddingModel,
      input: texts
    });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map(item => item.embedding);
}