import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as JWT from 'jsonwebtoken';

import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';

export const prisma = new PrismaClient();

export const utils = {
  isJSON: (data: string) => {
    try {
      JSON.parse(data);
    } catch {
      return false;
    }
    return true;
  },

  getTime: (): number => {
    return new Date().getTime();
  },

  genSalt: (saltRounds: number, value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return reject(err);
        bcrypt.hash(value, salt, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });
    });
  },

  compareHash: (hash: string, value: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(value, hash, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  healthCheck: async (): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      throw new Error(`Health check failed: ${e.message}`);
    }
  },

  getTokenFromHeader: (
    authorizationHeader: string | undefined,
  ): string | null => {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.replace('Bearer ', '');
    return token || null;
  },

  verifyToken: (token: string) => {
    try {
      return JWT.verify(token, process.env.APP_JWT_SECRET as string);
    } catch {
      return null;
    }
  },

  validateSchema: (schema: Joi.ObjectSchema) => {
    return (data: unknown) => {
      const { error } = schema.validate(data);
      if (error) {
        throw new Error(error.details[0].message);
      }
    };
  },

  preValidation: (schema: Joi.ObjectSchema) => {
    return (
      request: FastifyRequest,
      _reply: FastifyReply,
      done: (err?: Error) => void,
    ) => {
      const { error } = schema.validate(request.body);
      if (error) {
        return done(error);
      }
      done();
    };
  },
};
