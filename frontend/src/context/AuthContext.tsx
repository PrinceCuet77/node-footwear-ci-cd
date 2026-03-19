import React, { useCallback, useEffect, useReducer } from 'react';
import { setAccessToken } from '../services/api';
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../services/authService';
import type { AuthUser } from '../services/authService';
import { AuthContext } from './authContextDef';

// ─── State ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOADING' }
  | { type: 'SET_USER'; payload: AuthUser }
  | { type: 'CLEAR_USER' };

const reduce = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true };
    case 'SET_USER':
      return { user: action.payload, isLoading: false, isAuthenticated: true };
    case 'CLEAR_USER':
      return { user: null, isLoading: false, isAuthenticated: false };
  }
};

const USER_KEY = 'auth_user';

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reduce, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const clearSession = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('refresh_token'); // remove persisted prod refresh token
    dispatch({ type: 'CLEAR_USER' });
  }, []);

  // On mount: try to silently restore the session via refresh token cookie
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      dispatch({ type: 'CLEAR_USER' });
      return;
    }
    refreshAccessToken()
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
        dispatch({ type: 'SET_USER', payload: JSON.parse(stored) as AuthUser });
      })
      .catch(() => clearSession());
  }, [clearSession]);

  // Listen for session-expiry events fired by the axios interceptor
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, [clearSession]);

  const login = async (email: string, password: string) => {
    const { accessToken, ...user } = await loginUser(email, password);
    setAccessToken(accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
  };

  const register = async (email: string, password: string) => {
    await registerUser(email, password);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearSession();
    }
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    if (!state.user) return;
    const updated = { ...state.user, ...partial };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    dispatch({ type: 'SET_USER', payload: updated });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
