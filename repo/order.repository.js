const db = require("../config/db");

/* ================= ADDRESS ================= */

exports.getAddressById = async (connection, addressId, userId) => {
  const [rows] = await connection.execute(
    `
    SELECT
      full_name,
      phone,
      email,
      province,
      ward,
      street
    FROM addresses
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [addressId, userId],
  );

  return rows[0];
};

/* ================= CART ITEMS ================= */

exports.getCartItems = async (connection, userId) => {
  const [rows] = await connection.execute(
    `
    SELECT
      ci.product_id,
      ci.variant_id,
      ci.quantity,

      p.name AS product_name,

      pv.sku,

      COALESCE(
        pv.sale_price,
        pv.base_price
      ) AS price

    FROM carts c

    JOIN cart_items ci
      ON ci.cart_id = c.id

    JOIN products p
      ON p.id = ci.product_id

    JOIN product_variants pv
      ON pv.id = ci.variant_id
      AND pv.status = 'active'

    WHERE c.user_id = ?
      AND c.status = 'active'
    `,
    [userId],
  );

  return rows;
};

/* ================= ORDER ================= */

exports.createOrder = async (connection, data) => {
  const [result] = await connection.execute(
    `
    INSERT INTO orders
    (
      user_id,
      full_name,
      phone,
      email,
      province,
      ward,
      street,
      subtotal_amount,
      shipping_fee,
      total_amount,
      payment_method,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      data.user_id,
      data.full_name,
      data.phone,
      data.email,
      data.province,
      data.ward,
      data.street,
      data.subtotal_amount,
      data.shipping_fee,
      data.total_amount,
      data.payment_method,
    ],
  );

  return result.insertId;
};

/* ================= ORDER ITEM ================= */

exports.createOrderItem = async (connection, item) => {
  await connection.execute(
    `
    INSERT INTO order_items
    (
      order_id,
      product_id,
      variant_id,
      quantity,
      price
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      item.order_id,
      item.product_id,
      item.variant_id,
      item.quantity,
      item.price,
    ],
  );
};

/* ================= STOCK ================= */

exports.decreaseVariantStock = async (connection, { variantId, quantity }) => {
  const [result] = await connection.execute(
    `
    UPDATE product_variants
    SET
      stock = stock - ?,
      sold_count = sold_count + ?
    WHERE id = ?
      AND stock >= ?
    `,
    [quantity, quantity, variantId, quantity],
  );

  return result.affectedRows > 0;
};

exports.restoreVariantStock = async (connection, { variantId, quantity }) => {
  await connection.execute(
    `
    UPDATE product_variants
    SET
      stock = stock + ?,
      sold_count = GREATEST(sold_count - ?, 0)
    WHERE id = ?
    `,
    [quantity, quantity, variantId],
  );
};

/* ================= CLEAR CART ================= */

exports.clearCart = async (connection, userId) => {
  await connection.execute(
    `
    DELETE ci
    FROM cart_items ci
    JOIN carts c
      ON c.id = ci.cart_id
    WHERE c.user_id = ?
      AND c.status = 'active'
    `,
    [userId],
  );
};

/* ================= LIST ================= */

exports.findByUserId = async (userId, { limit, offset }) => {
  limit = Number(limit) || 10;
  offset = Number(offset) || 0;

  const [rows] = await db.execute(
    `
    SELECT
      id,
      subtotal_amount,
      shipping_fee,
      total_amount,
      status,
      payment_method,
      created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
    `,
    [userId],
  );

  return rows;
};

exports.countByUserId = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT COUNT(*) AS total
    FROM orders
    WHERE user_id = ?
    `,
    [userId],
  );

  return rows[0].total;
};

/* ================= DETAIL ================= */

exports.findOrderById = async (orderId, userId) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM orders
    WHERE id = ?
      AND user_id = ?
    `,
    [orderId, userId],
  );

  return rows[0];
};

exports.findOrderByIdWithItems = async (connection, orderId, userId) => {
  const [rows] = await connection.execute(
    `
    SELECT
      id,
      status,
      created_at
    FROM orders
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [orderId, userId],
  );

  return rows[0];
};

exports.getOrderItemsRaw = async (connection, orderId) => {
  const [rows] = await connection.execute(
    `
    SELECT
      variant_id,
      quantity
    FROM order_items
    WHERE order_id = ?
    `,
    [orderId],
  );

  return rows;
};

exports.cancelOrder = async (connection, orderId) => {
  await connection.execute(
    `
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = ?
    `,
    [orderId],
  );
};

/* ================= ORDER ITEMS DETAIL ================= */

exports.getOrderItems = async (orderId) => {
  const [rows] = await db.execute(
    `
    SELECT
      oi.id,
      oi.quantity,
      oi.price,

      p.id AS product_id,
      p.name,
      p.slug,

      pv.id AS variant_id,
      pv.sku,

      COALESCE(
        img.image_url,
        p.image_url
      ) AS image_url,

      a.id AS attribute_id,
      a.name AS attribute_name,
      a.slug AS attribute_slug,
      av.value AS attribute_value,

      c.id AS color_id,
      c.name AS color_name,
      c.hex_code

    FROM order_items oi

    JOIN products p
      ON p.id = oi.product_id

    LEFT JOIN product_variants pv
      ON pv.id = oi.variant_id

    LEFT JOIN product_images img
      ON img.variant_id = pv.id
      AND img.id = (
        SELECT id
        FROM product_images
        WHERE variant_id = pv.id
        ORDER BY sort_order ASC
        LIMIT 1
      )

    LEFT JOIN variant_attributes va
      ON va.variant_id = pv.id

    LEFT JOIN attribute_values av
      ON av.id = va.attribute_value_id

    LEFT JOIN attributes a
      ON a.id = av.attribute_id

    LEFT JOIN colors c
      ON c.id = av.color_id

    WHERE oi.order_id = ?
    `,
    [orderId],
  );

  const map = {};

  for (const r of rows) {
    if (!map[r.id]) {
      map[r.id] = {
        id: r.id,
        product_id: r.product_id,
        name: r.name,
        slug: r.slug,
        quantity: r.quantity,
        price: Number(r.price),
        image_url: r.image_url,

        variant: r.variant_id
          ? {
              id: r.variant_id,
              sku: r.sku,
              color: null,
              attributes: [],
            }
          : null,
      };
    }

    if (r.attribute_id) {
      map[r.id].variant?.attributes.push({
        id: r.attribute_id,
        name: r.attribute_name,
        value: r.attribute_value,
        slug: r.attribute_slug,
      });

      if (r.attribute_slug === "color") {
        map[r.id].variant.color = {
          id: r.color_id,
          name: r.color_name,
          hex_code: r.hex_code,
        };
      }
    }
  }

  return Object.values(map);
};

/* ================= PAID ================= */

exports.markOrderPaid = async (
  orderId,
  paymentMethod = "momo",
  connection = db,
) => {
  const [result] = await connection.execute(
    `
    UPDATE orders
    SET
      status = CASE
        WHEN status != 'paid'
        THEN 'paid'
        ELSE status
      END,
      payment_method = ?
    WHERE id = ?
    `,
    [paymentMethod, orderId],
  );

  return result.affectedRows > 0;
};
