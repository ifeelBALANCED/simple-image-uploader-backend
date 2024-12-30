import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';

export async function imageRouter(fastify: FastifyInstance) {
  fastify.post(
    '/image/upload',
    {
      schema: {
        tags: ['image'],
        summary: 'Image upload',
        description: 'Upload images in various formats',
        querystring: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: { type: 'string', description: 'User ID' },
          },
        },
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: { type: 'string', description: 'JWT token' },
          },
        },
        consumes: ['multipart/form-data'],
        response: {
          200: {
            description: 'Image uploaded successfully',
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  url: { type: 'string' },
                  originalName: { type: 'string' },
                  size: { type: 'number' },
                  mimetype: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      preValidation: (req, reply, done) => {
        const { authorization } = req.headers;
        if (!authorization) {
          return reply
            .status(400)
            .send({ message: 'Authorization header is missing' });
        }
        done();
      },
    },
    controllers.uploadMimetypeImage,
  );

  fastify.get(
    '/image/list',
    {
      schema: {
        tags: ['image'],
        summary: 'List uploaded images',
        description: 'Retrieve all images uploaded by a user',
        querystring: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: { type: 'string', description: 'User ID' },
          },
        },
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: { type: 'string', description: 'JWT token' },
          },
        },
        response: {
          200: {
            description: 'List of images',
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    url: { type: 'string' },
                    originalName: { type: 'string' },
                    size: { type: 'number' },
                    mimetype: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              message: { type: 'string' },
            },
          },
          404: {
            description: 'User not found',
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              message: { type: 'string' },
            },
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
      },
      preValidation: (req, reply, done) => {
        const { authorization } = req.headers;
        if (!authorization) {
          return reply
            .status(400)
            .send({ message: 'Authorization header is missing' });
        }
        done();
      },
    },
    controllers.showUploadsAsList,
  );
}
