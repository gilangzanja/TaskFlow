import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAuthRouter } from './routes/auth.js';
import { createTasksRouter } from './routes/tasks.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const createApp = (config) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        },
      },
    }),
  );
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use('/api', (request, response, next) => {
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
      next();
      return;
    }

    if (request.get('origin') !== config.appOrigin) {
      response.status(403).json({ error: 'Request origin is not allowed.' });
      return;
    }

    if (!request.is('application/json')) {
      response.status(415).json({ error: 'Requests must use application/json.' });
      return;
    }

    next();
  });

  app.use('/api/auth', createAuthRouter(config));
  app.use('/api/tasks', createTasksRouter(config));
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'API route not found.' });
  });

  const distributionDirectory = path.join(projectRoot, 'dist');
  app.use(express.static(distributionDirectory, { index: false }));
  app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => {
    response.sendFile(path.join(distributionDirectory, 'index.html'));
  });

  app.use((error, _request, response, _next) => {
    console.error('TaskFlow request failed.', {
      name: error.name,
      status: error.status ?? 500,
    });

    if (response.headersSent) {
      return;
    }

    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
      ? error.status
      : 500;
    response.status(status).json({
      error: status === 500 ? 'An unexpected server error occurred.' : 'The request could not be processed.',
    });
  });

  return app;
};
