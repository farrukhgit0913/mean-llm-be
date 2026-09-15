import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';

import chatRoutes
  from './routes/chat.routes.js';

import documentRoutes
  from './routes/document.routes.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);

app.use(
  express.json({
    limit: '2mb'
  })
);

app.get(
  '/api/health',
  (_req, res) => {
    res.json({
      status: 'ok'
    });
  }
);

app.use(
  '/api/chat',
  chatRoutes
);

app.use(
  '/api/documents',
  documentRoutes
);

export default app;