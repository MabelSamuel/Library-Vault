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

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/password-reset', requestPasswordReset);
router.post('/password-reset/confirm', resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/logout', protect, requireAuth(logout));

export default router;