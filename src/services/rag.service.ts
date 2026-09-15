import { getDb } from '../db/mongodb.js';
import { env } from '../config/env.js';
import { createEmbedding } from './embedding.service.js';

export interface RetrievedChunk {
  content: string;
  filename: string;
  score?: number;
}

export async function retrieveContext(
  query: string,
  limit = 5
): Promise<RetrievedChunk[]> {

  const queryEmbedding =
    await createEmbedding(query);

  const collection =
    getDb().collection('document_chunks');

  const results =
    await collection.aggregate([
      {
        $vectorSearch: {
          index: env.vectorIndexName,

          path: 'embedding',

          queryVector: queryEmbedding,

          numCandidates: 100,

          limit
        }
      },

      {
        $project: {
          _id: 0,

          content: 1,

          filename: 1,

          score: {
            $meta: 'vectorSearchScore'
          }
        }
      }
    ]).toArray();

  return results as RetrievedChunk[];
}