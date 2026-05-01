import { z } from 'zod';

export const emailPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const passwordResetSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export type EmailPasswordFormValues = z.infer<typeof emailPasswordSchema>;
export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
