require("dotenv").config();

exports.MOMO_CONFIG = {
  endpoint: process.env.MOMO_ENDPOINT,
  queryEndpoint: process.env.MOMO_QUERY_ENDPOINT,

  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,

  requestType: process.env.MOMO_REQUEST_TYPE,
  ipnUrl: process.env.MOMO_IPN_URL,
};
