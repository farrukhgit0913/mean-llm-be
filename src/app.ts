import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import chatRoutes from './routes/chat.routes.js';
import documentRoutes from './routes/document.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const startedAt = Date.now();

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4200';

app.use(
  cors({
    origin: corsOrigin
  })
);

app.use(express.json());

// Serve the backend status dashboard
const publicPath = path.resolve(__dirname, '../public');

app.use(express.static(publicPath));

// Health API
app.get('/health', (_req, res) => {
  const uptimeSeconds = Math.floor(
    (Date.now() - startedAt) / 1000
  );

  res.json({
    status: 'healthy',
    service: 'mean-llm-server',
    uptime: uptimeSeconds,
    node: process.version,
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString()
  });
});

// Root status dashboard
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

export default app;