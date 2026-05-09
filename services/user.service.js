const repo = require("../repo/user.repository");
const hashUtil = require("../utils/hash");
const AppError = require("../utils/AppError");

/**
 * GET USER BY ID
 */
exports.getById = async (id) => {
  const user = await repo.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

/**
 * GET ALL USERS
 */
exports.getAll = async () => {
  return repo.findAll();
};

/**
 * UPDATE USER (SAFE FIELDS)
 */
exports.update = async (id, data) => {
  const user = await repo.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await repo.update(id, data);
};

/**
 * CHANGE PASSWORD
 *
 * Handles two scenarios:
 * 1. Google users setting a password for the first time (linking email/password login)
 * 2. Email/password users changing their existing password
 */
exports.changePassword = async (id, { currentPassword, newPassword }) => {
  if (!newPassword) {
    throw new AppError("New password is required", 400);
  }

  // Password length validation
  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const user = await repo.findByIdWithPassword(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Scenario 1: User logged in with Google (has google_id but no password)
  // They are setting a password for the first time to link email/password login
  if (user.google_id && !user.password) {
    const hashed = await hashUtil.hash(newPassword);
    await repo.updatePassword(id, hashed);
    return;
  }

  // Scenario 2: User has a password (either Google user changed it before, or email/password user)
  // They must provide the correct current password to change it
  if (!currentPassword) {
    throw new AppError("Current password is required", 400);
  }

  if (!user.password) {
    throw new AppError(
      "Account has no password set. Please use Google login or set a password first.",
      400,
    );
  }

  const ok = await hashUtil.compare(currentPassword, user.password);
  if (!ok) {
    throw new AppError("Current password is incorrect", 400);
  }

  const hashed = await hashUtil.hash(newPassword);
  await repo.updatePassword(id, hashed);
};
