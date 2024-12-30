import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { loginSchema, signupSchema } from '../schemas/user.schema';
import { utils } from '../utils';

export async function authRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'User login',
        description: 'Endpoint for user login',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        response: {
          200: {
            description: 'Successful login',
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      preValidation: utils.preValidation(loginSchema),
    },
    controllers.login,
  );

  fastify.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'User registration',
        description: 'Endpoint for user registration',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        response: {
          201: {
            description: 'User created successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      preValidation: utils.preValidation(signupSchema),
    },
    controllers.signUp,
  );

  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'User logout',
        description: 'Endpoint for user logout',
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: { type: 'string', description: 'JWT token' },
          },
        },
        response: {
          200: {
            description: 'Successful logout',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          400: {
            description: 'Bad request',
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
    controllers.logout,
  );
}
