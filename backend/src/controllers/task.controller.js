import prisma from "../config/prisma.js";
import { logAudit } from "../utils/audit.js";




// ======================================
// API 16: Create Task
// ======================================
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = "medium", dueDate } = req.body;

    const { userId, tenantId } = req.user;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    // Verify project belongs to tenant
    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    });

    if (!project || project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Project doesn't belong to user's tenant"
      });
    }

    // Verify assigned user belongs to same tenant
    if (assignedTo) {
      const user = await prisma.users.findUnique({
        where: { id: assignedTo }
      });

      if (!user || user.tenant_id !== tenantId) {
        return res.status(400).json({
          success: false,
          message: "Assigned user doesn't belong to same tenant"
        });
      }
    }

    const task = await prisma.tasks.create({
      data: {
        title,
        description,
        priority,
        due_date: dueDate ? new Date(dueDate) : null,
        status: "todo",
        project_id: projectId,
        tenant_id: tenantId,
        assigned_to: assignedTo || null
      }
    });

    await logAudit({
      tenantId,
      userId,
      action: "CREATE_TASK",
      entityType: "task",
      entityId: task.id,
      ip: req.ip
    });

    return res.status(201).json({ success: true, data: task });

  } catch (err) {
    console.error("CreateTask Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================
// API 17: List Project Tasks
// ======================================
export const listProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      status,
      assignedTo,
      priority,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;

    // 1️⃣ Verify project belongs to tenant
    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    });

    if (!project || project.tenant_id !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "Project doesn't belong to user's tenant"
      });
    }

    // 2️⃣ Filters
    const where = {
      project_id: projectId
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assigned_to = assignedTo;

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive"
      };
    }

    // 3️⃣ Fetch tasks
    const [tasks, total] = await Promise.all([
      prisma.tasks.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: [
          { priority: "desc" },
          { due_date: "asc" }
        ],
        include: {
          assignee: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      }),
      prisma.tasks.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        tasks,
        total,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error("ListTasks Error:", error);
    next(error);
  }
};

// ================================
// API 18: Update Task Status
// ================================
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user || {};

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const task = await prisma.tasks.findUnique({
      where: { id: taskId }
    });

    if (!task || task.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Task doesn't belong to user's tenant"
      });
    }

    const updated = await prisma.tasks.update({
      where: { id: taskId },
      data: { status }
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updated_at
      }
    });

  } catch (err) {
    console.error("UpdateTaskStatus Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate
    } = req.body;

    // 1️⃣ Fetch task
    const task = await prisma.tasks.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // 2️⃣ Tenant check
    if (task.tenant_id !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "Task doesn't belong to user's tenant"
      });
    }

    // 3️⃣ Validate assigned user tenant
    if (assignedTo !== undefined) {
      if (assignedTo !== null) {
        const user = await prisma.users.findUnique({
          where: { id: assignedTo }
        });

        if (!user || user.tenant_id !== req.user.tenantId) {
          return res.status(400).json({
            success: false,
            message: "Assigned user doesn't belong to same tenant"
          });
        }
      }
    }

    // 4️⃣ Build update data SAFELY
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    if (assignedTo !== undefined) {
      updateData.assigned_to = assignedTo; // can be null
    }

    if (dueDate !== undefined) {
      updateData.due_date = dueDate ? new Date(dueDate) : null;
    }

    // 5️⃣ Update task
    const updatedTask = await prisma.tasks.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

// ================================
// API 20: Delete Task
// ================================

return res.status(200).json({
  success: true,
  message: "Task updated successfully",
  data: updatedTask
});
  } catch (error) {
  console.error("UpdateTask Error:", error);
  next(error);
}
};
 export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { tenantId } = req.user;

    // 1️⃣ Find task and check tenant
    const task = await prisma.tasks.findUnique({ where: { id: taskId } });
    if (!task || task.tenant_id !== tenantId) {
      return res.status(404).json({ success: false, message: "Task not found or doesn't belong to tenant" });
    }

    // 2️⃣ Delete task
    await prisma.tasks.delete({ where: { id: taskId } });

    // 3️⃣ Return success
    return res.status(200).json({ success: true, message: "Task deleted successfully" });

  } catch (err) {
    console.error("DeleteTask Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


