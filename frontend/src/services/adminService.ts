import api from './api';

export interface AdminUser {
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'ADMIN' | '';
  isVerified?: boolean | '';
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  sort?: 'asc' | 'desc';
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export const getAllUsers = async (
  params: GetUsersParams = {},
): Promise<UsersResponse> => {
  // Strip empty strings so they are not sent as query params
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined),
  );
  const res = await api.get('/api/admin/users', { params: clean });
  return res.data.data as UsersResponse;
};

export const getSingleUser = async (id: number): Promise<AdminUser> => {
  const res = await api.get(`/api/admin/users/${id}`);
  return res.data.data as AdminUser;
};

export const updateUserRole = async (
  id: number,
  role: 'USER' | 'ADMIN',
): Promise<AdminUser> => {
  const res = await api.patch(`/api/admin/users/${id}/role`, { role });
  return res.data.data as AdminUser;
};
