const db = require("../config/db");

/* ================= CART ================= */

exports.getActiveCart = async (userId) => {
  const [[row]] = await db.execute(
    `SELECT * FROM carts WHERE user_id = ? AND status = 'active'`,
    [userId],
  );
  return row;
};

/* ================= GET ITEMS ================= */

exports.getItems = async (cartId) => {
  const [rows] = await db.execute(
    `
    SELECT
      ci.id AS cart_item_id,
      ci.quantity,
      ci.price,

      p.id AS product_id,
      p.name AS product_name,
      p.slug AS product_slug,

      pv.id AS variant_id,
      pv.sku,

      COALESCE(img.image_url, p.image_url) AS image_url,

      a.id AS attribute_id,
      a.name AS attribute_name,
      a.slug AS attribute_slug,
      av.value AS attribute_value,

      c.id AS color_id,
      c.hex_code

    FROM cart_items ci

    JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id

    LEFT JOIN product_images img
      ON img.variant_id = pv.id
     AND img.id = (
       SELECT pi2.id
       FROM product_images pi2
       WHERE pi2.variant_id = pv.id
       ORDER BY pi2.sort_order ASC, pi2.id ASC
       LIMIT 1
     )

    LEFT JOIN variant_attributes va ON va.variant_id = pv.id
    LEFT JOIN attribute_values av ON av.id = va.attribute_value_id
    LEFT JOIN attributes a ON a.id = av.attribute_id

    LEFT JOIN colors c 
      ON LOWER(c.name) = LOWER(av.value)

    WHERE ci.cart_id = ?
    ORDER BY ci.id
    `,
    [cartId],
  );

  return rows;
};

/* ================= FIND ITEM ================= */

exports.findItem = async (cartId, productId, variantId) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM cart_items
    WHERE cart_id = ?
      AND product_id = ?
      AND variant_id = ?
    `,
    [cartId, productId, variantId],
  );

  return rows[0];
};

/* ================= ADD ITEM ================= */

exports.addItem = ({ cart_id, product_id, variant_id, quantity, price }) =>
  db.execute(
    `
    INSERT INTO cart_items
    (cart_id, product_id, variant_id, quantity, price)
    VALUES (?, ?, ?, ?, ?)
    `,
    [cart_id, product_id, variant_id, quantity, price],
  );

/* ================= UPDATE ================= */

exports.updateQuantity = (id, quantity) =>
  db.execute(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [quantity, id]);

/* ================= GET ITEM ================= */

exports.getItemById = async (itemId, userId) => {
  const [[row]] = await db.execute(
    `
    SELECT ci.*
    FROM cart_items ci
    JOIN carts c ON c.id = ci.cart_id
    WHERE ci.id = ? AND c.user_id = ?
    `,
    [itemId, userId],
  );
  return row;
};

/* ================= REMOVE ================= */

exports.removeItem = (id) =>
  db.execute(`DELETE FROM cart_items WHERE id = ?`, [id]);

/* ================= CLEAR ================= */

exports.clearCart = (cartId) =>
  db.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

/* ================= VARIANT ================= */

exports.getVariant = async (variantId) => {
  const [[row]] = await db.execute(
    `
    SELECT 
      id,
      product_id,
      stock,
      base_price,
      sale_price
    FROM product_variants
    WHERE id = ? AND status = 'active'
    `,
    [variantId],
  );

  return row;
};
