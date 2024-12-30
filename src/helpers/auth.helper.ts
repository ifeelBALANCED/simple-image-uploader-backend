import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma, utils } from '../utils';
import { ERRORS } from './errors.helper';

export const checkValidRequest = (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const token = utils.getTokenFromHeader(request.headers.authorization);
  if (!token) {
    return reply
      .code(ERRORS.unauthorizedAccess.statusCode)
      .send(ERRORS.unauthorizedAccess.message);
  }

  const decoded = utils.verifyToken(token);
  if (!decoded || typeof decoded === 'string') {
    return reply
      .code(ERRORS.unauthorizedAccess.statusCode)
      .send(ERRORS.unauthorizedAccess.message);
  }

  // Optionally attach the decoded payload to the request object
  request['decoded'] = decoded;
};

export const checkValidUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const token = utils.getTokenFromHeader(request.headers.authorization);
  if (!token) {
    return reply
      .code(ERRORS.unauthorizedAccess.statusCode)
      .send(ERRORS.unauthorizedAccess.message);
  }

  const decoded = utils.verifyToken(token);
  if (!decoded || typeof decoded === 'string' || !decoded.id) {
    return reply
      .code(ERRORS.unauthorizedAccess.statusCode)
      .send(ERRORS.unauthorizedAccess.message);
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!userData) {
      return reply
        .code(ERRORS.unauthorizedAccess.statusCode)
        .send(ERRORS.unauthorizedAccess.message);
    }

    // Attach the user data to the request object
    request['authUser'] = userData;
  } catch {
    return reply
      .code(ERRORS.unauthorizedAccess.statusCode)
      .send(ERRORS.unauthorizedAccess.message);
  }
};
