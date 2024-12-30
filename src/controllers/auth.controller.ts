import { FastifyReply, FastifyRequest } from 'fastify';
import * as JWT from 'jsonwebtoken';
import { STANDARD } from '../constants/request';
import { ERRORS, handleServerError } from '../helpers/errors.helper';
import { IUserLoginDto, IUserSignupDto } from '../schemas/user.schema';
import { prisma, utils } from '../utils';

export const login = async (
  request: FastifyRequest<{ Body: IUserLoginDto }>,
  reply: FastifyReply,
) => {
  try {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw ERRORS.userNotExists;
    }

    const isPasswordValid = await utils.compareHash(user.password, password);

    if (!isPasswordValid) {
      throw ERRORS.userCredError;
    }

    const token = JWT.sign(
      { id: user.id, email: user.email },
      process.env.APP_JWT_SECRET as string,
    );

    return reply.code(STANDARD.OK.statusCode).send({ token });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const signUp = async (
  request: FastifyRequest<{ Body: IUserSignupDto }>,
  reply: FastifyReply,
) => {
  try {
    const { email, password } = request.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      throw ERRORS.userExists;
    }

    const hashPass = await utils.genSalt(10, password);
    const createUser = await prisma.user.create({
      data: { email, password: String(hashPass) },
    });

    const token = JWT.sign(
      { id: createUser.id, email: createUser.email },
      process.env.APP_JWT_SECRET as string,
    );

    delete createUser.password;

    return reply.code(STANDARD.OK.statusCode).send({ token });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const logout = async (_request: FastifyRequest, reply: FastifyReply) => {
  try {
    return reply.code(STANDARD.OK.statusCode).send({ message: 'Logged out' });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
