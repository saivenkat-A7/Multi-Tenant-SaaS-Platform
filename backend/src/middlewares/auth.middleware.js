import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ NORMALIZE PAYLOAD
    req.user = {
      id: decoded.id || decoded.userId,        // match your loginController token
      tenantId: decoded.tenantId || decoded.tenant_id,
      role: decoded.role
    };

    if (!req.user.id || !req.user.tenantId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default authMiddleware;