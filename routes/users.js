import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { getAllUsers, createUser, updateUserRole, deleteUser } from '../controllers/users.js';

const router = express.Router();

router.get('/', protect, authorize({ roles: ['super_admin', 'admin'] }), getAllUsers);
router.post('/', protect, authorize({ roles: ['super_admin', 'admin'] }), createUser);
router.put('/:id/role', protect, authorize({ minRole: 'super_admin' }), updateUserRole);
router.delete('/:id', protect, authorize({ minRole: 'super_admin' }), deleteUser);

export default router;
