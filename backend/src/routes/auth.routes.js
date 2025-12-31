import express from 'express';
import { registerTenant, loginController, me, logout } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register-tenant', registerTenant);
router.post('/login', loginController);

// Protected routes
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

export default router;
