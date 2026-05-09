const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
