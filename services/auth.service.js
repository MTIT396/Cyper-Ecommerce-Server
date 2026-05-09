const userRepo = require("../repo/user.repository");
const hashUtil = require("../utils/hash");
const jwtUtil = require("../utils/jwt");
const db = require("../config/db");
const AppError = require("../utils/AppError");

/**
 * REGISTER
 */
exports.register = async ({ email, password, username }) => {
  const existed = await userRepo.findByEmail(email);
  if (existed) {
    throw new AppError("Email already exists", 400);
  }

  const hashed = await hashUtil.hash(password);

  const userId = await userRepo.create({
    email,
    password: hashed,
    username,
  });

  // tạo cart mặc ịnh
  await db.execute("INSERT INTO carts (user_id, status) VALUES (?, 'active')", [
    userId,
  ]);

  return {
    id: userId,
    email,
    username,
  };
};

/**
 * LOGIN
 */
exports.login = async ({ email, password }, res) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AppError("Tài khoản hoặc mật khẩu không chính xác.", 401);
  }
  if (!user.password) {
    throw new AppError(
      "Tài khoản này sử dụng đăng nhập bằng tài khoản Google. Vui lòng đăng nhập bằng tài khoản Google.",
      401,
    );
  }
  const ok = await hashUtil.compare(password, user.password);
  if (!ok) {
    throw new AppError("Invalid credentials", 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  };

  const accessToken = jwtUtil.signAccessToken(payload);
  const refreshToken = jwtUtil.signRefreshToken(payload);

  // 🔐 SET COOKIE – KHÔNG TRẢ TOKEN CHO FE
  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 phút
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

  return {
    user: payload,
  };
};

exports.logout = async (req, res) => {
  // 👉 Lấy refresh token từ cookie (nếu có)
  const refreshToken = req.cookies?.refresh_token;

  // (OPTIONAL - KHUYẾN NGHỊ)
  // Nếu bạn có bảng refresh_tokens thì revoke ở ây
  // if (refreshToken) {
  //   await db.execute(
  //     "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?",
  //     [refreshToken]
  //   );
  // }

  // ❌ Xoá cookie (PHẢI TRÙNG OPTION LÚC SET)
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return {
    message: "Logout successfully",
  };
};
