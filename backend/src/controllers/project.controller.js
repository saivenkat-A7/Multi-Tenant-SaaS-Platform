import prisma from "../config/prisma.js";
import { logAudit } from "../utils/audit.js";

// ================================
// API 12: Create Project
// ================================
export const createProject = async (req, res) => {
  try {
    const { tenantId, id:userId } = req.user || {};
    const { name, description, status = "active" } = req.body;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    const projectCount = await prisma.projects.count({
      where: { tenant_id: tenantId }
    });

    if (projectCount >= tenant.max_projects) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached"
      });
    }

    const project = await prisma.projects.create({
      data: {
        name,
        description,
        status,
        tenant: {
          connect: { id: tenantId }
        },
        creator: {
          connect: { id: userId }
        }
      }
    });

    await logAudit({
      tenantId,
      userId,
      action: "CREATE_PROJECT",
      entityType: "project",
      entityId: project.id,
      ip: req.ip
    });

    return res.status(201).json({
      success: true,
      data: project
    });

  } catch (err) {
    console.error("CreateProject Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ================================
// API 13: List Projects
// ================================
export const listProjects = async (req, res) => {
  try {
    const { tenantId } = req.user || {};
    const { search, status, page = 1, limit = 20 } = req.query;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const filters = { tenant_id: tenantId };

    if (status) filters.status = status;
    if (search) {
      filters.name = { contains: search, mode: "insensitive" };
    }

    const offset = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.projects.findMany({
        where: filters,
        skip: offset,
        take: Math.min(parseInt(limit), 100),
        orderBy: { created_at: "desc" },
        include: {
          creator: {
            select: {
              id: true,
              full_name: true,
              is_active: true // ✅ valid field
            }
          },
          tasks: true
        }
      }),
      prisma.projects.count({ where: filters })
    ]);

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdBy: {
            id: p.creator.id,
            fullName: p.creator.full_name,
            status: p.creator.is_active // ✅ mapped safely
          },
          taskCount: p.tasks.length,
          completedTaskCount: p.tasks.filter(
            t => t.status === "completed"
          ).length,
          createdAt: p.created_at
        })),
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });

  } catch (err) {
    console.error("ListProjects Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ================================
// API 14: Update Project
// ================================
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user || {};
    const { name, description, status } = req.body;

    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    });

    if (!project || project.tenant_id !== tenantId) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (role !== "tenant_admin" && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // ✅ Partial update only
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.projects.update({
      where: { id: projectId },
      data: updateData
    });

    await logAudit({
      tenantId,
      userId,
      action: "UPDATE_PROJECT",
      entityType: "project",
      entityId: projectId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: "Project updated successfully",
      data: updated
    });

  } catch (err) {
    console.error("UpdateProject Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ================================
// API 15: Delete Project
// ================================
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user || {};

    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    });

    if (!project || project.tenant_id !== tenantId) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (role !== "tenant_admin" && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    await prisma.projects.delete({
      where: { id: projectId }
    });

    await logAudit({
      tenantId,
      userId,
      action: "DELETE_PROJECT",
      entityType: "project",
      entityId: projectId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (err) {
    console.error("DeleteProject Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
