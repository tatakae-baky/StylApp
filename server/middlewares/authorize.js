import UserModel from "../models/user.model.js";

// Usage: authorize(['ADMIN']) or authorize(['ADMIN','BRAND_OWNER'])
const authorize = (allowedRoles = []) => {
  return async (request, response, next) => {
    try {
      const userId = request.userId;
      if (!userId) {
        return response.status(401).json({
          message: "Unauthorized",
          error: true,
          success: false,
        });
      }

      // Load the user to check role; also expose for downstream use
      const user = await UserModel.findById(userId).select("role brandId isApproved");
      if (!user) {
        return response.status(401).json({
          message: "Unauthorized",
          error: true,
          success: false,
        });
      }

      request.user = user;

      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          return response.status(403).json({
            message: "Forbidden",
            error: true,
            success: false,
          });
        }
      }

      next();
    } catch (err) {
      return response.status(500).json({
        message: "Authorization check failed",
        error: true,
        success: false,
      });
    }
  };
};

export default authorize;

