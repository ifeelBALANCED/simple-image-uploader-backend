import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { v2 as cloudinary } from 'cloudinary';
import fastify from 'fastify';
import loadConfig from './config/env.config';
import { MAX_FILE_SIZE } from './constants/format';
import { authRouter } from './routes/auth.router';
import { imageRouter } from './routes/image.router';
import { userRouter } from './routes/user.router';
import { utils } from './utils';

loadConfig();

cloudinary.config({
  cloud_name: process.env.CDN_CLOUD_NAME,
  api_key: process.env.CDN_API_KEY,
  api_secret: process.env.CDN_API_SECRET,
});

const port = Number(process.env.API_PORT);
const host = String(process.env.API_HOST);

const startServer = async () => {
  const server = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  });

  // Register middlewares
  server.register(formbody);
  server.register(helmet);

  // Configure CORS to allow all origins
  server.register(cors, {
    origin: (_, cb) => {
      cb(null, true);
    },
    credentials: true,
  });

  // Register multipart for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });

  // Register Swagger
  server.register(swagger, {
    swagger: {
      info: {
        title: 'Image uploader API',
        description: 'API documentation for the image uploader service',
        version: '1.0.0',
      },
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  // Register Swagger UI
  server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Register routes
  server.register(authRouter, { prefix: '/api' });
  server.register(imageRouter, { prefix: '/api' });
  server.register(userRouter, { prefix: '/api' });

  // Set error handler
  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    reply.status(500).send({ error: 'Something went wrong' });
  });

  // Health check route
  server.get('/health', async (_request, reply) => {
    try {
      await utils.healthCheck();
      reply.status(200).send({
        message: 'Health check endpoint success.',
      });
    } catch {
      reply.status(500).send({
        message: 'Health check endpoint failed.',
      });
    }
  });

  // Root route
  server.get('/', (_, reply) => {
    reply.status(200).send({ message: 'Hello from fastify boilerplate!' });
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        await server.close();
        console.log(`Closed application on ${signal}`);
        process.exit(0);
      } catch (err) {
        console.error(`Error closing application on ${signal}`, err);
        process.exit(1);
      }
    });
  });

  // Start server
  try {
    await server.listen({
      port,
      host,
    });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();
