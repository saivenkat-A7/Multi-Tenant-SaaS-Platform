import prisma from '../config/prisma.js';

export const logAudit = async ({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  ip
}) => {
  await prisma.audit_logs.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ip
    }
  });
};
