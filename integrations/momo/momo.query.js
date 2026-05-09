const axios = require("axios");
const crypto = require("crypto");
const { MOMO_CONFIG } = require("./momo.constants");

exports.queryTransaction = async ({ momoOrderId, requestId }) => {
  const { partnerCode, accessKey, secretKey } = MOMO_CONFIG;

  const raw = [
    `accessKey=${accessKey}`,
    `orderId=${momoOrderId}`,
    `partnerCode=${partnerCode}`,
    `requestId=${requestId}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(raw)
    .digest("hex");

  const payload = {
    partnerCode,
    requestId,
    orderId: momoOrderId,
    signature,
    lang: "vi",
  };

  const response = await axios.post(
    "https://test-payment.momo.vn/v2/gateway/api/query",
    payload,
  );

  return response.data;
};
