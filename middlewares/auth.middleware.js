const jwtUtil = require("../utils/jwt");

module.exports = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  //  Không có cả 2 token
  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 1️⃣ THỬ VERIFY ACCESS TOKEN
  if (accessToken) {
    try {
      const payload = jwtUtil.verifyAccessToken(accessToken);
      req.user = payload;
      return next();
    } catch (err) {
      // nếu access token hết hạn → thử refresh
      if (err.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  }

  // 2️⃣ ACCESS TOKEN HẾT HẠN → VERIFY REFRESH TOKEN
  if (!refreshToken) {
    return res.status(401).json({ message: "Session expired" });
  }

  try {
    const payload = jwtUtil.verifyRefreshToken(refreshToken);

    // 3️⃣ TẠO ACCESS TOKEN MỚI
    const newAccessToken = jwtUtil.signAccessToken({
      id: payload.id,
      email: payload.email,
      username: payload.username,
    });

    // 4️⃣ SET COOKIE LẠI
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
