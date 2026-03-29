const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    console.log("requireAuth decoded:", decoded);
    // JWT payload uses 'id' field — expose as userId for consistency
    req.user = {
      userId: decoded.id || decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Not authorized, token failed" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, error: "Not authorized as an admin" });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    console.log("optionalAuth decoded:", decoded);
    // decoded has { id, role } — expose as userId for consistency
    req.user = { userId: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.log("optionalAuth token invalid:", err.message);
    req.user = null;
    next();
  }
};

module.exports = { requireAuth, requireAdmin, optionalAuth };
