import { sendResponse } from '@utils/response';
import { Request, Response, NextFunction } from 'express';
import * as UserService from '@services/user.service';
import { STATUS_CODE } from '@constants/statusCode';

export const getOwnProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return sendResponse(res, 'User not found', STATUS_CODE.NOT_FOUND);
    }

    return sendResponse(
      res,
      'Profile fetched successfully',
      STATUS_CODE.OK,
      user,
    );
  } catch (error) {
    next(error);
  }
};

export const updateOwnProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, avatarUrl } = req.body as {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };

    const updatedUser = await UserService.updateUser(userId, {
      firstName,
      lastName,
      avatarUrl,
    });

    return sendResponse(
      res,
      'Profile updated successfully',
      STATUS_CODE.OK,
      updatedUser,
    );
  } catch (error) {
    next(error);
  }
};
