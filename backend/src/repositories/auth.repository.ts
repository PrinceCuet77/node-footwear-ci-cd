import { prisma } from '@config/db';
import * as bcrypt from 'bcrypt';

export const findUserByEmail = async (email: string) => {
  if (!email) {
    return null;
  }
  return prisma.user.findUnique({ where: { email } });
};

export const createUserByCredentials = async (
  email: string,
  password: string,
) => {
  const saltRounds = process.env.BCRYPT_SALT_ROUNDS
    ? parseInt(process.env.BCRYPT_SALT_ROUNDS)
    : 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
};
