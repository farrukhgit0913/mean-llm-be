import { getDb } from '../db/mongodb.js';
import { createEmbeddings } from './embedding.service.js';

export interface RetrievedChunk {
  content: string;
  filename: string;
  score: number;
}

interface DocumentChunk {
  content: string;
  filename: string;
  embedding: number[];
}

export const RAG_SCORE_THRESHOLD = 0.70;

function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  if (
    a.length !== b.length ||
    a.length === 0
  ) {
    return 0;
  }

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (
    magnitudeA === 0 ||
    magnitudeB === 0
  ) {
    return 0;
  }

  return (
    dot /
    (
      Math.sqrt(magnitudeA) *
      Math.sqrt(magnitudeB)
    )
  );
}

export async function retrieveContext(
  query: string,
  limit = 5
): Promise<RetrievedChunk[]> {

  // 1. Create query embedding using Ollama.
  const [queryEmbedding] =
    await createEmbeddings([query]);

  if (!queryEmbedding?.length) {
    throw new Error(
      'Failed to create query embedding'
    );
  }

  // 2. Get document chunks from local MongoDB.
  const collection =
    getDb().collection<DocumentChunk>(
      'document_chunks'
    );

  const chunks =
    await collection
      .find({
        embedding: {
          $exists: true
        }
      })
      .project({
        _id: 0,
        content: 1,
        filename: 1,
        embedding: 1
      })
      .toArray();

  // No documents in knowledge base.
  if (chunks.length === 0) {
    return [];
  }

  // 3. Calculate cosine similarity locally.
  const results = chunks
    .map(chunk => ({
      content: chunk.content,
      filename: chunk.filename,
      score: cosineSimilarity(
        queryEmbedding,
        chunk.embedding
      )
    }))
    .filter(
      result =>
        result.score >=
        RAG_SCORE_THRESHOLD
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);

  return results;
}