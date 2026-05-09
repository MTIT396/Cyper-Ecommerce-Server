const service = require("../services/user.service");
const uploadService = require("../services/upload.service");
const AppError = require("../utils/AppError");

/**
 * GET /users/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id; // lấy từ JWT middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await service.getById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ko trả password
    delete user.password;

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /users/me
 */
exports.updateMe = async (req, res, next) => {
  try {
    // chỉ cho update field an toàn
    const allowedFields = ["username", "avatar"];
    const data = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    await service.update(req.user.id, data);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /users/me/password
 *
 * Change or set password:
 * - Google users (first time): provide only newPassword to link email/password login
 * - Email/password users: provide both currentPassword and newPassword
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      throw new AppError("New password is required", 400);
    }

    await service.changePassword(req.user.id, {
      currentPassword,
      newPassword,
    });

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /users/me/profile
 * Update username and upload avatar in one request
 */
exports.updateProfileWithAvatar = async (req, res, next) => {
  try {
    const { username } = req.body;
    const file = req.file;

    // Validate at least one field is provided
    if (!username && !file) {
      throw new AppError("Provide username or avatar file", 400);
    }

    const updateData = {};

    // Update username if provided
    if (username) {
      updateData.username = username;
    }

    // Upload avatar if provided
    if (file) {
      const uploadResult = await uploadService.uploadImage(file);
      updateData.avatar = uploadResult.url;
    }

    // Update user profile
    await service.update(req.user.id, updateData);

    res.json({
      success: true,
      data: updateData,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /users
 * 🔐 ADMIN ONLY
 */
exports.getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new AppError("Forbidden", 403);
    }

    const users = await service.getAll();

    // ❌ strip sensitive fields
    const safeUsers = users.map(({ password, ...u }) => u);

    res.json({ users: safeUsers });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /users/:id
 * 🔐 ADMIN ONLY
 */
exports.getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new AppError("Forbidden", 403);
    }

    const user = await service.getById(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    delete user.password;

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
