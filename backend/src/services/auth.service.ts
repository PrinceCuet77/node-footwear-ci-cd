import * as AuthRepository from '@repositories/auth.repository';
import { TokenPayload } from '@src/interface/token.type';
import * as bcrypt from 'bcrypt';
import { type CookieOptions } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '30m';
const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE
  ? parseInt(process.env.COOKIE_MAX_AGE)
  : 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '1d';
const REFRESH_TOKEN_COOKIE_MAX_AGE = process.env.REFRESH_TOKEN_COOKIE_MAX_AGE
  ? parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE)
  : 24 * 60 * 60 * 1000;
const JWT_RESET_SECRET =
  process.env.JWT_RESET_SECRET || 'your_jwt_reset_secret';
const JWT_RESET_EXPIRES_IN = process.env.JWT_RESET_EXPIRES_IN || '1h';

export const findExistingUserByEmail = async (email: string) => {
  return AuthRepository.findUserByEmail(email);
};

export const createNewUser = async (email: string, password: string) => {
  return AuthRepository.createUserByCredentials(email, password);
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await AuthRepository.findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return null;
  }

  return user;
};

export const generateTokens = async (
  id: number,
  email: string,
  role: string,
) => {
  const accessToken = jwt.sign(
    { id, email, role },
    ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );
  const refreshToken = jwt.sign(
    { id, email, role },
    REFRESH_TOKEN_SECRET as Secret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return { accessToken, refreshToken };
};

export const getRefreshTokenCookieOptions = (
  isLogout = false,
): CookieOptions => {
  if (isLogout) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 0,
    };
  }
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  };
};

export const verifyRefreshToken = async (refreshToken: string) => {
  return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as TokenPayload;
};
