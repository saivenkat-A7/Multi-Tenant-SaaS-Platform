import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { logAudit } from '../utils/audit.js';

/* --------------------------------------------------
   API 8: ADD USER TO TENANT
-------------------------------------------------- */
export const addUserToTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const {
      role: requesterRole,
      id: requesterId,
      tenantId: userTenantId
    } = req.user;

    console.log('REQ.USER =>', req.user);

    // 🔒 Tenant isolation
    if (userTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access'
      });
    }

    // 🔒 Role check
    if (requesterRole !== 'tenant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { email, password, fullName, role = 'user' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const userCount = await prisma.users.count({
      where: { tenant_id: tenantId }
    });

    if (userCount >= tenant.max_users) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached'
      });
    }

    const existingUser = await prisma.users.findFirst({
      where: { email, tenant_id: tenantId }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role,
        tenant_id: tenantId,
        is_active: true
      }
    });

    await logAudit({
      tenantId,
      userId: requesterId, // ✅ FIXED
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: newUser.id,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        tenantId: newUser.tenant_id,
        isActive: newUser.is_active,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('AddUser Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
/* --------------------------------------------------
   API 9: LIST TENANT USERS
-------------------------------------------------- */
export const listTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // 🔒 tenant isolation (important)
    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access'
      });
    }

    const users = await prisma.users.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true
      }
    });

    res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at
      }))
    });
  } catch (err) {
    console.error('ListTenantUsers Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* --------------------------------------------------
   API 10: UPDATE USER
-------------------------------------------------- */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      role: requesterRole,
      tenantId,
      id: requesterId
    } = req.user;

    const { fullName, role, isActive } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const isSelf = requesterId === userId;
    const isTenantAdmin = requesterRole === 'tenant_admin';

    if (isSelf && (role !== undefined || isActive !== undefined)) {
      return res.status(403).json({
        success: false,
        message: 'Only tenant admin can update role or status'
      });
    }

    if (!isSelf && !isTenantAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (isTenantAdmin && role !== undefined) updateData.role = role;
    if (isTenantAdmin && isActive !== undefined)
      updateData.is_active = isActive;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData
    });

    await logAudit({
      tenantId,
      userId: requesterId,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: userId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (err) {
    console.error('UpdateUser Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* --------------------------------------------------
   API 11: DELETE USER
-------------------------------------------------- */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      role,
      tenantId,
      id: requesterId
    } = req.user;

    if (role !== 'tenant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (requesterId === userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete self'
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user || user.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    await prisma.tasks.updateMany({
      where: { assigned_to: userId },
      data: { assigned_to: null }
    });

    await prisma.users.delete({
      where: { id: userId }
    });

    await logAudit({
      tenantId,
      userId: requesterId,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: userId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('DeleteUser Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};