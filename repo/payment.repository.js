const db = require("../config/db");

exports.create = async (payload) => {
  const { order_id, provider, momo_order_id, request_id, amount, status } =
    payload;

  const [result] = await db.execute(
    `
    INSERT INTO payments 
    (order_id, provider, momo_order_id, request_id, amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [order_id, provider, momo_order_id, request_id, amount, status],
  );

  return result.insertId;
};

exports.findByMomoOrderId = async (momoOrderId) => {
  const [rows] = await db.execute(
    `SELECT * FROM payments WHERE momo_order_id = ? LIMIT 1`,
    [momoOrderId],
  );

  return rows[0] || null;
};

exports.findOrderById = async (orderId) => {
  const [rows] = await db.execute(
    `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  );
  return rows[0] || null;
};

exports.findLatestByOrderId = async (orderId) => {
  const [rows] = await db.execute(
    `
    SELECT * FROM payments
    WHERE order_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [orderId],
  );

  return rows[0] || null;
};

exports.updateByMomoOrderId = async (momoOrderId, data) => {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(
      typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key],
    );
  }

  values.push(momoOrderId);

  const [result] = await db.execute(
    `
    UPDATE payments
    SET ${fields.join(", ")}
    WHERE momo_order_id = ?
    `,
    values,
  );

  return result;
};

exports.findPendingByOrderId = async (orderId) => {
  const [rows] = await db.execute(
    `
    SELECT * FROM payments
    WHERE order_id = ? AND status = 'pending'
    LIMIT 1
    `,
    [orderId],
  );

  return rows[0] || null;
};
