import { sendResponse } from '@utils/response';
import { Request, Response, NextFunction } from 'express';
import * as UserService from '@services/user.service';
import { STATUS_CODE } from '@constants/statusCode';
import { Role } from '@src/generated/prisma/enums';

const VALID_SORT_FIELDS = [
  'createdAt',
  'firstName',
  'lastName',
  'email',
] as const;
type SortableField = (typeof VALID_SORT_FIELDS)[number];

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );

    const search = (req.query.search as string)?.trim() || undefined;

    const roleParam = req.query.role as string | undefined;
    const role =
      roleParam === 'USER' || roleParam === 'ADMIN'
        ? (roleParam as Role)
        : undefined;

    const isVerifiedParam = req.query.isVerified as string | undefined;
    const isVerified =
      isVerifiedParam === 'true'
        ? true
        : isVerifiedParam === 'false'
          ? false
          : undefined;

    const sortByParam = req.query.sortBy as string | undefined;
    const sortBy: SortableField = VALID_SORT_FIELDS.includes(
      sortByParam as SortableField,
    )
      ? (sortByParam as SortableField)
      : 'createdAt';

    const sortParam = req.query.sort as string | undefined;
    const sort: 'asc' | 'desc' = sortParam === 'asc' ? 'asc' : 'desc';

    const { users, total } = await UserService.getAllUsers({
      page,
      limit,
      search,
      role,
      isVerified,
      sortBy,
      sort,
    });

    return sendResponse(res, 'Users fetched successfully', STATUS_CODE.OK, {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendResponse(res, 'Invalid user ID', STATUS_CODE.BAD_REQUEST);
    }

    const user = await UserService.getUserById(id);
    if (!user) {
      return sendResponse(res, 'User not found', STATUS_CODE.NOT_FOUND);
    }

    return sendResponse(res, 'User fetched successfully', STATUS_CODE.OK, user);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendResponse(res, 'Invalid user ID', STATUS_CODE.BAD_REQUEST);
    }

    const { role } = req.body as { role: Role };

    const user = await UserService.getUserById(id);
    if (!user) {
      return sendResponse(res, 'User not found', STATUS_CODE.NOT_FOUND);
    }

    const updatedUser = await UserService.updateUserRole(id, role);

    return sendResponse(
      res,
      'User role updated successfully',
      STATUS_CODE.OK,
      updatedUser,
    );
  } catch (error) {
    next(error);
  }
};
