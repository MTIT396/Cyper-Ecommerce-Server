const axios = require("axios");
const { MOMO_CONFIG } = require("./momo.constants");
const { sign } = require("./momo.signature");

exports.createPayment = async ({
  momoOrderId,
  requestId,
  amount,
  redirectUrl,
}) => {
  const _amount = Number(amount);
  const {
    endpoint,
    partnerCode,
    accessKey,
    secretKey,
    ipnUrl,

    requestType,
  } = MOMO_CONFIG;

  const orderInfo = `Thanh toan don hang ${momoOrderId}`;
  const extraData = "";

  const raw = [
    `accessKey=${accessKey}`,
    `amount=${_amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${momoOrderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");

  const signature = sign(raw, secretKey);
  const payload = {
    partnerCode,
    accessKey,
    requestId,
    amount: _amount,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    signature,
    lang: "vi",
  };

  try {
    const response = await axios.post(endpoint, payload);
    return response.data;
  } catch (err) {
    console.error("MOMO ERROR:", err.response?.data);
    throw err;
  }
};
