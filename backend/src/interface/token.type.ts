export interface TokenPayload {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}
