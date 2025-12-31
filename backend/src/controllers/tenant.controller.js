import prisma from '../config/prisma.js';
import { logAudit } from '../utils/audit.js';

/* --------------------------------------------------
   API 5: GET TENANT DETAILS
-------------------------------------------------- */
export const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Stats
    const [totalUsers, totalProjects, totalTasks] = await Promise.all([
      prisma.users.count({ where: { tenant_id: tenantId } }),
      prisma.projects.count({ where: { tenant_id: tenantId } }),
      prisma.tasks.count({ where: { tenant_id: tenantId } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers,
          totalProjects,
          totalTasks
        }
      }
    });
  } catch (err) {
    console.error('GetTenant Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* --------------------------------------------------
   API 6: UPDATE TENANT
-------------------------------------------------- */
export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, userId } = req.user;
    const {
      name,
      status,
      subscriptionPlan,
      maxUsers,
      maxProjects
    } = req.body;

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const updateData = {};

    // Tenant admin → name only
    if (role === 'tenant_admin') {
      if (
        status !== undefined ||
        subscriptionPlan !== undefined ||
        maxUsers !== undefined ||
        maxProjects !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to update these fields'
        });
      }

      if (name !== undefined) updateData.name = name;
    }

    // Super admin → all fields
    if (role === 'super_admin') {
      if (name !== undefined) updateData.name = name;
      if (status !== undefined) updateData.status = status;
      if (subscriptionPlan !== undefined)
        updateData.subscription_plan = subscriptionPlan;
      if (maxUsers !== undefined) updateData.max_users = maxUsers;
      if (maxProjects !== undefined) updateData.max_projects = maxProjects;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedTenant = await prisma.tenants.update({
      where: { id: tenantId },
      data: updateData
    });

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: tenantId,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        updatedAt: updatedTenant.updated_at
      }
    });
  } catch (err) {
    console.error('UpdateTenant Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* --------------------------------------------------
   API 7: LIST ALL TENANTS (SUPER ADMIN)
-------------------------------------------------- */
export const listTenants = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.subscriptionPlan)
      filters.subscription_plan = req.query.subscriptionPlan;

    const [tenants, totalTenants] = await Promise.all([
      prisma.tenants.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.tenants.count({ where: filters })
    ]);

    const tenantData = await Promise.all(
      tenants.map(async (t) => {
        const [totalUsers, totalProjects] = await Promise.all([
          prisma.users.count({ where: { tenant_id: t.id } }),
          prisma.projects.count({ where: { tenant_id: t.id } })
        ]);

        return {
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers,
          totalProjects,
          createdAt: t.created_at
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        tenants: tenantData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTenants / limit),
          totalTenants,
          limit
        }
      }
    });
  } catch (err) {
    console.error('ListTenants Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
