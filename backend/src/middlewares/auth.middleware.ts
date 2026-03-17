import { STATUS_CODE } from '@constants/statusCode';
import { TokenPayload } from '@src/interface/token.type';
import { sendResponse } from '@utils/response';
import type { Request, Response, NextFunction } from 'express';
import jwt, { type Secret } from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const accessToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

  if (!accessToken) {
    return sendResponse(
      res,
      'Access token is required',
      STATUS_CODE.UNAUTHORIZED,
    );
  }

  try {
    const decode = jwt.verify(
      accessToken,
      ACCESS_TOKEN_SECRET as Secret,
    ) as TokenPayload;

    req.user = { id: decode.id, email: decode.email, role: decode.role };
    next();
  } catch {
    return sendResponse(
      res,
      'Invalid or expired access token',
      STATUS_CODE.UNAUTHORIZED,
    );
  }
};

export const requireRole =
  (...roles: Array<'USER' | 'ADMIN'>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendResponse(res, 'Unauthorized', STATUS_CODE.UNAUTHORIZED);
    }
    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        'You do not have permission to perform this action',
        STATUS_CODE.FORBIDDEN,
      );
    }
    next();
  };
