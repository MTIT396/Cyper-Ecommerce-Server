const paymentRepo = require("../repo/payment.repository");
const orderRepo = require("../repo/order.repository");
const momoClient = require("../integrations/momo/momo.client");
const momoService = require("../services/momo/momo.service");
const AppError = require("../utils/AppError");

/** CREATE PAYMENT */
exports.createMomoPayment = async (orderId, userId) => {
  const redirectUrl = `${process.env.CLIENT_URL}/payment/payment-result?order_id=${orderId}`;

  const order = await orderRepo.findOrderById(orderId, userId);
  if (!order) throw new AppError("Order not found", 404);

  const existing = await paymentRepo.findPendingByOrderId(orderId);
  if (existing) return existing.raw_response;

  const momoOrderId = `MOMO_${orderId}_${Date.now()}`;
  const requestId = `${momoOrderId}_REQ`;

  await paymentRepo.create({
    order_id: orderId,
    provider: "MOMO",
    momo_order_id: momoOrderId,
    request_id: requestId,
    amount: order.total_amount,
    status: "pending",
  });

  const momoResponse = await momoClient.createPayment({
    momoOrderId,
    requestId,
    amount: order.total_amount,
    redirectUrl,
  });

  await paymentRepo.updateByMomoOrderId(momoOrderId, {
    raw_response: momoResponse,
  });

  return momoResponse;
};

exports.checkTransaction = async (orderId, userId) => {
  const order = await orderRepo.findOrderById(orderId, userId);
  if (!order) throw new AppError("Order not found", 404);

  // ✅ luôn lấy payment mới nhất
  const payment = await paymentRepo.findLatestByOrderId(orderId);
  if (!payment) throw new AppError("Payment not found", 404);

  // ✅ nếu đã success → không làm gì nữa
  if (payment.status === "success") {
    return {
      data: { orderId, paymentStatus: "success" },
    };
  }

  // ⚠️ nếu pending → thử query MoMo
  if (payment.status === "pending") {
    try {
      const { status, momoData } =
        await momoService.checkTransactionStatus(payment);

      // ❗ không downgrade success
      if (status === "success") {
        await paymentRepo.updateByMomoOrderId(payment.momo_order_id, {
          status: "success",
          result_code: momoData.resultCode,
          trans_id: momoData.transId,
          raw_response: momoData,
        });

        await orderRepo.markOrderPaid(orderId, "momo");

        return {
          data: { orderId, paymentStatus: "success" },
        };
      }

      // ❗ nếu chưa success → vẫn coi là pending
      return {
        data: { orderId, paymentStatus: "pending" },
      };
    } catch (err) {
      return {
        data: { orderId, paymentStatus: "pending" },
      };
    }
  }

  // ❗ failed vẫn có thể là false negative → trả pending cho FE retry
  return {
    data: { orderId, paymentStatus: "pending" },
  };
};
