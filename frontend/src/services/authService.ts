import api from './api';

const IS_PROD = import.meta.env.VITE_NODE_ENV === 'production';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Shape stored in AuthContext (from login/register response)
export interface AuthUser {
  id: number;
  email: string;
  name: string; // "${firstName} ${lastName}" joined by the backend
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface LoginData extends AuthUser {
  accessToken: string;
  /** Only present when the backend runs with NODE_ENV=production */
  refreshToken?: string;
}

export const registerUser = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  const res = await api.post('/api/auth/register', { email, password });
  return res.data.data as AuthUser;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginData> => {
  const res = await api.post('/api/auth/login', { email, password });
  const data = res.data.data as LoginData;
  // In production the backend returns the refresh token in the body;
  // store it in localStorage so the /refresh-prod endpoint can use it.
  if (IS_PROD && data.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  }
  return data;
};

export const refreshAccessToken = async (): Promise<{
  accessToken: string;
}> => {
  if (IS_PROD) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const res = await api.post('/api/auth/refresh-prod', {
      refresh_token: refreshToken,
    });
    return res.data.data as { accessToken: string };
  }
  const res = await api.post('/api/auth/refresh');
  return res.data.data as { accessToken: string };
};

export const logoutUser = async (): Promise<void> => {
  await api.get('/api/auth/logout');
};
