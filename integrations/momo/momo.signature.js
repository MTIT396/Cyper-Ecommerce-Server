const crypto = require("crypto");

exports.sign = (raw, secretKey) => {
  return crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
};

exports.verify = (raw, signature, secretKey) => {
  const expected = exports.sign(raw, secretKey);
  return expected === signature;
};
