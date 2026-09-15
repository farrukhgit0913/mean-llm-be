import app from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './db/mongodb.js';

await connectMongo();

app.listen(
  env.port,
  () => {
    console.log(
      `API running on http://localhost:${env.port}`
    );
  }
);