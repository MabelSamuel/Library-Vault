import express from 'express';
import { protect } from '../middlewares/auth';
import {
  registerUser,
  loginUser,
  logout,
  refreshToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';
import { requireAuth } from '../utils/requireAuth';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";
import { validate } from '../middlewares/validate';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', refreshToken);
router.post('/password-reset',validate(requestPasswordResetSchema), requestPasswordReset);
router.post('/password-reset/confirm', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/logout', protect, requireAuth(logout));

export default router;