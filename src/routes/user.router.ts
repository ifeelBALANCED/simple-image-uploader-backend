import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';

export async function userRouter(fastify: FastifyInstance) {
  fastify.get(
    '/me',
    {
      schema: {
        tags: ['user'],
        summary: 'Get current user',
        description: 'Endpoint to retrieve the current authenticated user',
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: { type: 'string', description: 'JWT token' },
          },
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string', format: 'email' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
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
    controllers.getMe,
  );
}
