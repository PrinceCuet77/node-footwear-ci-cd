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

export const getNewRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies['refresh_token'] as string | undefined;
    if (!refreshToken) {
      return sendResponse(
        res,
        'No refresh token is provided!',
        STATUS_CODE.UNAUTHORIZED,
      );
    }

    const decoded = await AuthService.verifyRefreshToken(refreshToken);

    const { id, email, role } = decoded;
    const { accessToken: newAccessToken } = await AuthService.generateTokens(
      id,
      email,
      role,
    );

    return sendResponse(res, 'Access Token is refreshed', STATUS_CODE.OK, {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return sendResponse(
      res,
      'Invalid or expired refresh token',
      STATUS_CODE.UNAUTHORIZED,
    );
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie(
      'refresh_token',
      AuthService.getRefreshTokenCookieOptions(true),
    );

    return sendResponse(res, 'Logout successful', STATUS_CODE.OK);
  } catch (error) {
    return sendResponse(
      res,
      error instanceof Error ? error.message : 'Logout failed',
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    );
  }
};
