import type { FastifySchema } from 'fastify';

export interface SwaggerFastifySchema extends FastifySchema {
  tags?: string[];
  summary?: string;
  description?: string;
  security?: Array<{ [key: string]: string[] }>;
}
