import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { tenantAccessMiddleware } from '../middlewares/tenantAuth.middleware.js';
import {
  getTenantDetails,
  updateTenant,
  listTenants
} from '../controllers/tenant.controller.js';

const router = express.Router();

// API 7
router.get('/', authMiddleware, listTenants);

// API 5
router.get(
  '/:tenantId',
  authMiddleware,
  tenantAccessMiddleware,
  getTenantDetails
);

// API 6
router.put(
  '/:tenantId',
  authMiddleware,
  tenantAccessMiddleware,
  updateTenant
);

export default router;
