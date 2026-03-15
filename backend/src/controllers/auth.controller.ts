import { sendResponse } from '@utils/response';
import { Request, Response, NextFunction } from 'express';
import * as AuthService from '@services/auth.service';
import { STATUS_CODE } from '@constants/statusCode';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await AuthService.findExistingUser(email);

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
}
