import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/hash.js';

export const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenants.create({
        data: {
          name: tenantName,
          subdomain,
          status: 'active',
          subscription_plan: 'free'
        }
      });

      const admin = await tx.users.create({
        data: {
          email: adminEmail,
          password_hash: await hashPassword(adminPassword),
          full_name: adminFullName,
          role: 'tenant_admin',
          tenant_id: tenant.id
        }
      });

      return { tenant, admin };
    });

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: result.tenant.id,
        subdomain: result.tenant.subdomain,
        adminUser: {
          id: result.admin.id,
          email: result.admin.email,
          fullName: result.admin.full_name,
          role: result.admin.role
        }
      }
    });
  } catch (err) {
    res.status(409).json({ success: false, message: 'Tenant or email exists' });
  }
};
// Convert JWT_EXPIRES_IN (like "24h" or "30m") to seconds
const getExpiresInSeconds = (expiresIn) => {
  if (!expiresIn) return 24 * 60 * 60; // default 24h in seconds
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 24 * 60 * 60;
  }
};

export const loginController = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  const tenant = await prisma.tenants.findUnique({ where: { subdomain: tenantSubdomain } });
  if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

  const user = await prisma.users.findFirst({ where: { email, tenant_id: tenant.id } });
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const expiresIn = getExpiresInSeconds(process.env.JWT_EXPIRES_IN);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: tenant.id
      },
      token,
      expiresIn
    }
  });
};


export const me = async (req, res) => {
  const user = await prisma.users.findUnique({
    where: { id: req.user.id },
    include: { tenant: true }
  });

  if (!user)
    return res.status(404).json({ success: false, message: 'User not found' });

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      tenant: user.tenant
    }
  });
};

export const logout = async (req, res) => {
  // For JWT, usually we don't store sessions; you can implement blacklist if needed
  res.json({ success: true, message: 'Logged out successfully' });
};
