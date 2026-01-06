import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.email(),
    password: z.string().min(8),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3),
    password: z.string().min(8),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(8),
  }),
});
