const orderService = require("../services/order.service");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { paymentMethod, addressId, shippingFee } = req.body;

    if (!paymentMethod || !addressId || shippingFee === undefined) {
      return res.status(400).json({
        message: "Payment method, addressId, shippingFee are required",
      });
    }

    const result = await orderService.createOrder({
      userId,
      paymentMethod,
      addressId,
      shippingFee,
    });

    res.status(201).json({
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await orderService.getOrdersByUser({
      userId,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id;

    const orderId = req.params.id;

    const order = await orderService.getOrderDetail({
      orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= CANCEL ================= */

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orderId = req.params.id;

    const result = await orderService.cancelOrder({
      orderId,
      userId,
    });
    res.json({
      message: "Order cancelled successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};
