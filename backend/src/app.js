import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from "@prisma/client";

// Middlewares
import authMiddleware from './middlewares/auth.middleware.js';
import {tenantAccessMiddleware} from './middlewares/tenantAuth.middleware.js';
import {tenantUserAccess} from './middlewares/tenantUserAccess.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';


// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from "./routes/task.routes.js";

const app = express();
app.use(cors({ origin: ["http://frontend:3000","http://localhost:3000"], credentials: true }));
app.use(morgan('dev'));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Health check

const prisma = new PrismaClient();

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

// PUBLIC routes
app.use('/api/auth', authRoutes);

// PROTECTED routes (tenant-based)
app.use(
  '/api/tenants',
  authMiddleware,

    // Ensures tenant exists and user belongs
 userRoutes
);
app.use('/api', authMiddleware, userRoutes);
app.use('/api', authMiddleware, userRoutes);
app.use('/api/tenants', authMiddleware, tenantRoutes);
app.use(
  '/api/users',
  authMiddleware,
 

  userRoutes
);
app.use("/api/tasks",taskRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api", authMiddleware, taskRoutes);
// Error handler (last)
app.use(errorMiddleware);

export default app;
