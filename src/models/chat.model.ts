import { ObjectId } from 'mongodb';

export type MessageRole =
  | 'user'
  | 'assistant';

export interface ChatMessage {
  _id?: ObjectId;

  conversationId: string;

  role: MessageRole;

  content: string;

  createdAt: Date;
}

export interface Conversation {
  _id?: ObjectId;

  title: string;

  createdAt: Date;

  updatedAt: Date;
}