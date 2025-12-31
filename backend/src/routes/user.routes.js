import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { tenantUserAccess } from '../middlewares/tenantUserAccess.middleware.js';
import {
  addUserToTenant,
  listTenantUsers,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

/* TENANT USERS */
router.post(
  '/:tenantId/users',
  authMiddleware,
  tenantUserAccess,
  addUserToTenant
);

router.get(
  '/:tenantId/users',
  authMiddleware,
  tenantUserAccess,
  listTenantUsers
);

/* USER CRUD */
router.put('/users/:userId', authMiddleware, updateUser);
router.delete('/users/:userId', authMiddleware, deleteUser);

export default router;