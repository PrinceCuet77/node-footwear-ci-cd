import { prisma } from '@config/db';
import { Role } from '@src/generated/prisma/enums';
import { Prisma } from '@src/generated/prisma/client';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const SORTABLE_FIELDS = [
  'createdAt',
  'firstName',
  'lastName',
  'email',
] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

export interface FindAllUsersOptions {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  isVerified?: boolean;
  sortBy?: SortableField;
  sort?: 'asc' | 'desc';
}

export const findAllUsers = async (options: FindAllUsersOptions) => {
  const {
    page,
    limit,
    search,
    role,
    isVerified,
    sortBy = 'createdAt',
    sort = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(role !== undefined && { role }),
    ...(isVerified !== undefined && { isVerified }),
  };

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    [SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt']: sort,
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      where,
      select: USER_SELECT,
      orderBy,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id }, select: USER_SELECT });
};

export const updateUserById = async (
  id: number,
  data: { firstName?: string; lastName?: string; avatarUrl?: string },
) => {
  return prisma.user.update({ where: { id }, data, select: USER_SELECT });
};

export const updateUserRoleById = async (id: number, role: Role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: USER_SELECT,
  });
};
