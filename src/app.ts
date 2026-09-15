import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDb } from './db/mongodb.js';

import chatRoutes from './routes/chat.routes.js';
import documentRoutes from './routes/document.routes.js';

const app = express();

const startedAt = Date.now();

const PORT =
  Number(process.env.PORT ?? 3000);

const CORS_ORIGIN =
  process.env.CORS_ORIGIN ??
  'http://localhost:4200';

const OLLAMA_URL =
  process.env.OLLAMA_URL ??
  'http://localhost:11434';

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

/*
|--------------------------------------------------------------------------
| Health Helpers
|--------------------------------------------------------------------------
*/

async function checkOllama(): Promise<{
  connected: boolean;
  models: string[];
}> {

  try {

    const response =
      await fetch(
        `${OLLAMA_URL}/api/tags`
      );

    if (!response.ok) {

      console.error(
        `Ollama health check returned ${response.status}`
      );

      return {
        connected: false,
        models: []
      };

    }

    const data =
      await response.json() as {
        models?: Array<{
          name?: string;
        }>;
      };

    const models =
      Array.isArray(data.models)
        ? data.models
            .map(
              model => model.name
            )
            .filter(
              (
                name
              ): name is string =>
                typeof name === 'string'
            )
        : [];

    return {
      connected: true,
      models
    };

  } catch (error) {

    console.error(
      'Ollama health check failed:',
      error
    );

    return {
      connected: false,
      models: []
    };

  }

}

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
  '/health',
  async (_req, res) => {

    const uptimeSeconds =
      Math.floor(
        (Date.now() - startedAt) /
        1000
      );

    let databaseStatus =
      'Disconnected';

    /*
    |--------------------------------------------------------------------------
    | MongoDB check
    |--------------------------------------------------------------------------
    */

    try {

      const db =
        getDb();

      await db.command({
        ping: 1
      });

      databaseStatus =
        'Connected';

    } catch (error) {

      console.error(
        'MongoDB health check failed:',
        error
      );

    }

    /*
    |--------------------------------------------------------------------------
    | Ollama check
    |--------------------------------------------------------------------------
    */

    const ollama =
      await checkOllama();

    /*
    |--------------------------------------------------------------------------
    | Overall health
    |--------------------------------------------------------------------------
    */

    const healthy =
      databaseStatus === 'Connected' &&
      ollama.connected;

    res.json({

      status:
        healthy
          ? 'healthy'
          : 'degraded',

      service:
        'mean-llm-server',

      uptime:
        uptimeSeconds,

      node:
        process.version,

      environment:
        process.env.NODE_ENV ??
        'development',

      database:
        databaseStatus,

      ollama,

      timestamp:
        new Date().toISOString()

    });

  }
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  '/api/chat',
  chatRoutes
);

app.use(
  '/api/documents',
  documentRoutes
);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const publicPath =
  path.join(
    __dirname,
    '../public'
  );

app.use(
  express.static(publicPath)
);

/*
|--------------------------------------------------------------------------
| Root
|--------------------------------------------------------------------------
*/

app.get(
  '/',
  (_req, res) => {

    res.sendFile(
      path.join(
        publicPath,
        'index.html'
      )
    );

  }
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(
  (_req, res) => {

    res.status(404).json({
      message:
        'Route not found'
    });

  }
);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {

    console.error(
      'Unhandled server error:',
      error
    );

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      message:
        'Internal server error'
    });

  }
);

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default app;