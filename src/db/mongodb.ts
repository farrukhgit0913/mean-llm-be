import { MongoClient, Db } from 'mongodb';
import { env } from '../config/env.js';

const client = new MongoClient(env.mongodbUri);

let database: Db;

export async function connectMongo(): Promise<Db> {
  await client.connect();

  database = client.db(env.mongodbDatabase);

  console.log('MongoDB connected');

  return database;
}

export function getDb(): Db {
  if (!database) {
    throw new Error('MongoDB has not been connected');
  }

  return database;
}