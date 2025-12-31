export const tenantUserAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const { role, tenantId: userTenantId } = req.user;
  const { tenantId } = req.params;

  // Super admin can access any tenant
  if (role === "super_admin") return next();

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message: "Tenant ID missing in route"
    });
  }

  if (String(userTenantId) !== String(tenantId)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access"
    });
  }

  next();
};