import express from 'express';
import { protect, authorize } from '../middlewares/auth';
import { getAllUsers, createUser, updateUserRole, deleteUser } from '../controllers/user.controller';
import { requireAuth } from '../utils/requireAuth';

const router = express.Router();

router.get('/', protect, authorize({ roles: ['super_admin', 'admin'] }), getAllUsers);
router.post('/', protect, authorize({ roles: ['super_admin', 'admin'] }), requireAuth(createUser));
router.put('/:id/role', protect, authorize({ minRole: 'super_admin' }), requireAuth(updateUserRole));
router.delete('/:id', protect, authorize({ minRole: 'super_admin' }), deleteUser);

export default router;
