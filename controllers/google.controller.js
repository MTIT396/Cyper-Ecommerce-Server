const axios = require("axios");
const jwtUtil = require("../utils/jwt");
const userRepo = require("../repo/user.repository");
const db = require("../config/db");

exports.googleLogin = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}?login=error`);
    }
    //  exchange token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token } = tokenRes.data;

    // get user info
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const { email, name, picture, id } = userInfo.data;
    //  find or create user
    let user = await userRepo.findByEmail(email);
    let isNewUser = false;

    const safeUser = {
      email: email ?? null,
      username: name ?? email?.split("@")[0] ?? "user",
      google_id: id ?? null,
      avatar: picture ?? null,
    };

    if (!user) {
      const userId = await userRepo.create(safeUser);
      isNewUser = true;

      // Create active cart for new user
      await db.execute(
        "INSERT INTO carts (user_id, status) VALUES (?, 'active')",
        [userId],
      );

      user = { id: userId, email, username: name, role: "user" };
    }

    //  generate token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const accessToken = jwtUtil.signAccessToken(payload);
    const refreshToken = jwtUtil.signRefreshToken(payload);

    //  set cookies
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 phút
        path: "/",
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        path: "/",
      });

    //  redirect to FE
    res.redirect(`${process.env.CLIENT_URL}?login=success`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}?login=error`);
  }
};
