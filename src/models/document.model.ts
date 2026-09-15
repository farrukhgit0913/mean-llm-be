import { ObjectId } from 'mongodb';

export interface DocumentChunk {
  _id?: ObjectId;

  documentId: string;

  filename: string;

  content: string;

  chunkIndex: number;

  embedding: number[];

  metadata?: {
    source?: string;
    page?: number;
  };

  createdAt: Date;
}