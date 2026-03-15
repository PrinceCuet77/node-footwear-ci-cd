import { sendResponse } from '@utils/response';
import { Request, Response, NextFunction } from 'express';
import * as AuthService from '@services/auth.service';
import { STATUS_CODE } from '@constants/statusCode';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await AuthService.findExistingUserByEmail(email);

    if (user) {
      return sendResponse(
        res,
        'A user already exists with the provided email. Please try another one.',
        STATUS_CODE.CONFLICT,
      );
    }

    const newUser = await AuthService.createNewUser(email, password);

    return sendResponse(
      res,
      'Registration is successful',
      STATUS_CODE.CREATED,
      {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser?.firstName || ''} ${newUser?.lastName || ''}`.trim(),
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await AuthService.authenticateUser(email, password);
    if (!user) {
      return sendResponse(
        res,
        'Invalid credentials!',
        STATUS_CODE.UNAUTHORIZED,
      );
    }

    const { accessToken, refreshToken } = await AuthService.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    res.cookie(
      'refresh_token',
      refreshToken,
      AuthService.getRefreshTokenCookieOptions(),
    );

    return sendResponse(res, 'Login is successful', STATUS_CODE.OK, {
      id: user.id,
      email: user.email,
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      avatarUrl: user.avatarUrl,
      role: user.role,
      accessToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
