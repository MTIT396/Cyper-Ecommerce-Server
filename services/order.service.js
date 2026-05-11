const db = require("../config/db");
const orderRepo = require("../repo/order.repository");
const AppError = require("../utils/AppError");

/* ================= CONSTANTS ================= */

const CANCEL_ORDER_TIME_LIMIT = 60 * 60 * 1000; // 1 hour

/* ================= HELPERS ================= */

const canCancelOrder = (order) => {
  if (!order) return false;

  if (order.status !== "pending") {
    return false;
  }

  const createdAt = new Date(order.created_at).getTime();

  if (Number.isNaN(createdAt)) {
    return false;
  }

  return Date.now() - createdAt <= CANCEL_ORDER_TIME_LIMIT;
};
/* ================= CREATE ================= */

exports.createOrder = async ({
  userId,
  paymentMethod,
  addressId,
  shippingFee = 0,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    /* ================= CART ITEMS ================= */

    const cartItems = await orderRepo.getCartItems(connection, userId);

    if (!cartItems.length) {
      throw new AppError("Cart is empty", 400);
    }

    /* ================= SUBTOTAL ================= */

    let subtotal = 0;

    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
    }

    const totalAmount = subtotal + shippingFee;

    /* ================= ADDRESS ================= */

    const address = await orderRepo.getAddressById(
      connection,
      addressId,
      userId,
    );

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    /* ================= DECREASE STOCK ================= */

    for (const item of cartItems) {
      const ok = await orderRepo.decreaseVariantStock(connection, {
        variantId: item.variant_id,
        quantity: item.quantity,
      });

      if (!ok) {
        throw new AppError(`Product ${item.product_name} out of stock`, 409);
      }
    }

    /* ================= CREATE ORDER ================= */

    const orderId = await orderRepo.createOrder(connection, {
      user_id: userId,

      ...address,

      subtotal_amount: subtotal,

      shipping_fee: shippingFee,

      total_amount: totalAmount,

      payment_method: paymentMethod,
    });

    /* ================= CREATE ORDER ITEMS ================= */

    for (const item of cartItems) {
      await orderRepo.createOrderItem(connection, {
        order_id: orderId,

        product_id: item.product_id,

        variant_id: item.variant_id,

        quantity: item.quantity,

        price: item.price,
      });
    }

    /* ================= CLEAR CART ================= */

    await orderRepo.clearCart(connection, userId);

    await connection.commit();

    return {
      order_id: orderId,

      subtotal,

      shipping_fee: shippingFee,

      total_amount: totalAmount,

      status: "pending",

      can_cancel: true,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/* ================= LIST ================= */

exports.getOrdersByUser = async ({ userId, page = 1, limit = 10 }) => {
  const page = Number(page) || 1;
  const limit = Number(limit) || 10;

  const offset = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    orderRepo.findByUserId(userId, {
      limit,
      offset,
    }),

    orderRepo.countByUserId(userId),
  ]);

  return {
    data: orders.map((o) => ({
      ...o,

      subtotal_amount: Number(o.subtotal_amount),

      shipping_fee: Number(o.shipping_fee),

      total_amount: Number(o.total_amount),

      can_cancel: canCancelOrder(o),
    })),

    meta: {
      page,

      limit,

      total,

      total_pages: Math.ceil(total / limit),
    },
  };
};

/* ================= DETAIL ================= */

exports.getOrderDetail = async ({ orderId, userId }) => {
  const order = await orderRepo.findOrderById(orderId, userId);
  if (!order) {
    return null;
  }

  const items = await orderRepo.getOrderItems(orderId);

  return {
    id: order.id,

    subtotal_amount: Number(order.subtotal_amount),

    shipping_fee: Number(order.shipping_fee),

    total_amount: Number(order.total_amount),

    status: order.status,

    payment_method: order.payment_method,

    can_cancel: canCancelOrder(order),

    shipping_address: {
      full_name: order.full_name,

      phone: order.phone,

      email: order.email,

      province: order.province,

      ward: order.ward,

      street: order.street,
    },

    items,

    created_at: order.created_at,

    cancelled_at: order.cancelled_at,
  };
};

/* ================= CANCEL ================= */

exports.cancelOrder = async ({ orderId, userId }) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    /* ================= FIND ORDER ================= */

    const order = await orderRepo.findOrderByIdWithItems(
      connection,
      orderId,
      userId,
    );

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    /* ================= VALIDATE ================= */

    if (order.status === "cancelled") {
      throw new AppError("Order already cancelled", 400);
    }

    if (!canCancelOrder(order)) {
      throw new AppError("Orders can only be cancelled within 1 hour", 400);
    }

    /**
     * Optional:
     * If using online payment (MoMo, VNPay...)
     * you should verify payment status here
     * before allowing cancellation.
     */

    /* ================= RESTORE STOCK ================= */

    const items = await orderRepo.getOrderItemsRaw(connection, orderId);

    for (const item of items) {
      await orderRepo.restoreVariantStock(connection, {
        variantId: item.variant_id,

        quantity: item.quantity,
      });
    }

    /* ================= UPDATE ORDER STATUS ================= */

    await orderRepo.cancelOrder(connection, orderId);

    await connection.commit();

    return {
      order_id: Number(orderId),

      status: "cancelled",

      cancelled_at: new Date(),
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
