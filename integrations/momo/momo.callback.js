const { MOMO_CONFIG } = require("./momo.constants");
const { verify } = require("./momo.signature");
const paymentRepo = require("../../repo/payment.repository");
const orderRepo = require("../../repo/order.repository");

exports.handleCallback = async (req, res) => {
  try {
    const data = req.body;

    const raw = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${data.amount}`,
      `extraData=${data.extraData}`,
      `message=${data.message}`,
      `orderId=${data.orderId}`,
      `orderInfo=${data.orderInfo}`,
      `orderType=${data.orderType}`,
      `partnerCode=${data.partnerCode}`,
      `payType=${data.payType}`,
      `requestId=${data.requestId}`,
      `responseTime=${data.responseTime}`,
      `resultCode=${data.resultCode}`,
      `transId=${data.transId}`,
    ].join("&");

    const isValid = verify(raw, data.signature, MOMO_CONFIG.secretKey);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const payment = await paymentRepo.findByMomoOrderId(data.orderId);
    if (!payment) return res.status(200).end();

    //  idempotent
    if (payment.status === "success") {
      return res.status(200).json({ message: "Already success" });
    }

    const newStatus = data.resultCode === 0 ? "success" : "failed";

    await paymentRepo.updateByMomoOrderId(data.orderId, {
      status: newStatus,
      result_code: data.resultCode,
      trans_id: data.transId,
      raw_response: data,
    });

    if (newStatus === "success") {
      await orderRepo.updateStatus(payment.order_id, "paid");
      await orderRepo.updatePaymentMethod(payment.order_id, "momo");
    }

    return res.status(200).json({ message: "OK" });
  } catch (err) {
    console.error("IPN error:", err);
    return res.status(200).end();
  }
};
