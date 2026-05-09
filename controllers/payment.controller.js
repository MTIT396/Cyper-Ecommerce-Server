const paymentService = require("../services/payment.service");
const momoCallback = require("../integrations/momo/momo.callback");

// Create payment
exports.createMomo = async (req, res) => {
  try {
    const { orderId } = req.body;

    const result = await paymentService.createMomoPayment(orderId, req.user.id);

    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// Momo callback
exports.momoCallback = momoCallback.handleCallback;

// Check transaction status
exports.checkTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.body;

    const result = await paymentService.checkTransaction(orderId, req.user.id);

    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};
