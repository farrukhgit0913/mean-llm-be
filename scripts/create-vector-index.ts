import { connectMongo, getDb } from '../src/db/mongodb.js';
import { env } from '../src/config/env.js';

await connectMongo();

const collection =
  getDb().collection('document_chunks');

const indexes =
  await collection
    .listSearchIndexes(env.vectorIndexName)
    .toArray();

if (indexes.length === 0) {

  await collection.createSearchIndex({
    name: env.vectorIndexName,

    type: 'vectorSearch',

    definition: {
      fields: [
        {
          type: 'vector',

          path: 'embedding',

          numDimensions: 1536,

          similarity: 'cosine'
        }
      ]
    }
  });

  console.log(
    'Vector index creation requested'
  );

} else {

  console.log(
    'Vector index already exists'
  );
}

process.exit(0);