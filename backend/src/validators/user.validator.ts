import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name must not be empty')
    .max(50, 'First name must not exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name must not be empty')
    .max(50, 'Last name must not exceed 50 characters')
    .optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either USER or ADMIN',
  }),
});
