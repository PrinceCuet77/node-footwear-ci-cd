import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .max(100, 'Email must not exceed 100 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(32, { message: 'Password must be at most 32 characters long' })
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character',
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .max(100, 'Email must not exceed 100 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(32, { message: 'Password must be at most 32 characters long' }),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export const logoutSchema = z.object({
  accessToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
