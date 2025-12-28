import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { adminRoute, loginUser, logout, refreshToken, registerUser } from '../controllers/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
// router.get('/admin', protect, authorize('super_admin', 'admin'), adminRoute);

export default router;
