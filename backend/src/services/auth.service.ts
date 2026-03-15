import * as AuthRepository from '@repositories/auth.repository';

export const findExistingUser = async (email: string) => {
  return AuthRepository.findUserByEmail(email);
};

export const createNewUser = async (email: string, password: string) => {
  return AuthRepository.createUserByCredentials(email, password);
};
