import { z } from 'zod';

/**
 * Mirrors the bean-validation constraints on the backend's request DTOs
 * exactly, so the user sees the same rule client-side that the server will
 * ultimately enforce (see dto/request/RegisterRequest.java,
 * ChangePasswordRequest.java, UpdateProfileRequest.java, LoginRequest.java).
 * The backend re-validates on every request regardless - this is purely
 * about giving faster, friendlier feedback than a round trip.
 */
const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must contain at least one lowercase letter, one uppercase letter, and one digit';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email must be a valid address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name must be at most 255 characters'),
  email: z.string().min(1, 'Email is required').email('Email must be a valid address'),
  password: z
    .string()
    .min(8, 'Password must be between 8 and 100 characters')
    .max(100, 'Password must be between 8 and 100 characters')
    .regex(PASSWORD_COMPLEXITY, PASSWORD_COMPLEXITY_MESSAGE),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be between 8 and 100 characters')
      .max(100, 'Password must be between 8 and 100 characters')
      .regex(PASSWORD_COMPLEXITY, PASSWORD_COMPLEXITY_MESSAGE),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name must be at most 255 characters'),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
