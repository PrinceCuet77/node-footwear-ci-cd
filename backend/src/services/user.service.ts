import * as UserRepository from '@repositories/user.repository';
import { type FindAllUsersOptions } from '@repositories/user.repository';
import { Role } from '@src/generated/prisma/enums';

export const getAllUsers = async (options: FindAllUsersOptions) => {
  return UserRepository.findAllUsers(options);
};

export const getUserById = async (id: number) => {
  return UserRepository.findUserById(id);
};

export const updateUser = async (
  id: number,
  data: { firstName?: string; lastName?: string; avatarUrl?: string },
) => {
  return UserRepository.updateUserById(id, data);
};

export const updateUserRole = async (id: number, role: Role) => {
  return UserRepository.updateUserRoleById(id, role);
};
