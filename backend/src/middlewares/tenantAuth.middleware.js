export const tenantAccessMiddleware = (req, res, next) => {
  const { role, tenantId: userTenantId } = req.user;
  const { tenantId } = req.params;

  // Only apply check if tenantId exists in params
  if (!tenantId) {
    return next();
  }

  if (role === 'super_admin') {
    return next();
  }

  if (String(userTenantId) !== String(tenantId)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized tenant access'
    });
  }

  next();
};