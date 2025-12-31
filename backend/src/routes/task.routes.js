import express from "express";
import {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/projects/:projectId/tasks", createTask);
router.get("/projects/:projectId/tasks", listProjectTasks);
router.patch("/tasks/:taskId/status", updateTaskStatus);
router.put("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);

export default router;
