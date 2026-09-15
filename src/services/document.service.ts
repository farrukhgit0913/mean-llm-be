import { getDb } from '../db/mongodb.js';
import { DocumentChunk } from '../models/document.model.js';
import {
  createEmbeddings
} from './embedding.service.js';

export async function ingestDocument(
  filename: string,
  text: string
) {

  const chunks = chunkText(text);

  const embeddings =
    await createEmbeddings(chunks);

  const documents: DocumentChunk[] =
    chunks.map((content, index) => ({
      documentId: crypto.randomUUID(),

      filename,

      content,

      chunkIndex: index,

      embedding: embeddings[index],

      createdAt: new Date()
    }));

  const collection =
    getDb().collection<DocumentChunk>(
      'document_chunks'
    );

  await collection.insertMany(documents);

  return {
    filename,
    chunks: documents.length
  };
}