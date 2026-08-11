const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Error checking role: " + err.message });
    }
  };
};

const checkOwnership = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({ message: "You don't own this resource" });
    }
    next();
  };
};

module.exports = { checkRole, checkOwnership };
