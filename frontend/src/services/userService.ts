import api from './api';

// Shape returned from GET /api/users/me and PATCH /api/users/me
export interface ProfileUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export const getProfile = async (): Promise<ProfileUser> => {
  const res = await api.get('/api/users/me');
  return res.data.data as ProfileUser;
};

export const updateProfile = async (
  data: UpdateProfileData,
): Promise<ProfileUser> => {
  const res = await api.patch('/api/users/me', data);
  return res.data.data as ProfileUser;
};
