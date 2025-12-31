import express from 'express';
import { createProject, listProjects, updateProject, deleteProject } from '../controllers/project.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', createProject);           // API 12
router.get('/', listProjects);             // API 13
router.put('/:projectId', updateProject);  // API 14
router.delete('/:projectId', deleteProject); // API 15

export default router;
