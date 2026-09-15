import { getDb } from '../db/mongodb.js';

import { DocumentChunk } from '../models/document.model.js';

import {
  createEmbeddings
} from './embedding.service.js';

function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + chunkSize,
      cleanedText.length
    );

    const chunk =
      cleanedText
        .slice(start, end)
        .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= cleanedText.length) {
      break;
    }

    start =
      end - overlap;
  }

  return chunks;
}

export async function ingestDocument(
  filename: string,
  text: string
) {
  const chunks =
    chunkText(text);

  if (chunks.length === 0) {
    throw new Error(
      'Document contains no readable text'
    );
  }

  console.log(
    '[DOCUMENT] Created chunks:',
    chunks.length
  );

  console.log(
    '[DOCUMENT] Creating embeddings with nomic-embed-text...'
  );

  const embeddings =
    await createEmbeddings(chunks);

  console.log(
    '[DOCUMENT] Embeddings created:',
    embeddings.length
  );

  if (
    embeddings.length !==
    chunks.length
  ) {
    throw new Error(
      `Embedding count mismatch: ` +
      `${embeddings.length} embeddings for ` +
      `${chunks.length} chunks`
    );
  }

  const invalidEmbedding =
    embeddings.find(
      embedding =>
        !Array.isArray(embedding) ||
        embedding.length === 0
    );

  if (invalidEmbedding) {
    throw new Error(
      'One or more embeddings are invalid'
    );
  }

  const documentId =
    crypto.randomUUID();

  const documents:
    DocumentChunk[] =
    chunks.map(
      (content, index) => ({
        documentId,
        filename,
        content,
        chunkIndex: index,
        embedding:
          embeddings[index],
        createdAt:
          new Date()
      })
    );

  const collection =
    getDb().collection<DocumentChunk>(
      'document_chunks'
    );

  await collection.insertMany(
    documents
  );

  console.log(
    '[DOCUMENT] Inserted into MongoDB:',
    documents.length
  );

  return {
    filename,
    chunks:
      documents.length
  };
}