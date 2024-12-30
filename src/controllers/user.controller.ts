import { FastifyReply, FastifyRequest } from 'fastify';
import * as JWT from 'jsonwebtoken';
import { STANDARD } from '../constants/request';
import { ERRORS, handleServerError } from '../helpers/errors.helper';
import { prisma, utils } from '../utils';

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = utils.getTokenFromHeader(request.headers.authorization);

    const decoded = JWT.verify(token, process.env.APP_JWT_SECRET as string) as {
      id: string;
      email: string;
    };

    if (!decoded || !decoded.email) {
      throw ERRORS.invalidToken;
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      throw ERRORS.userNotExists;
    }

    return reply.code(STANDARD.OK.statusCode).send({ user });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
