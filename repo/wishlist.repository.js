const db = require("../config/db");

/**
 * GET wishlist (kèm min price từ variants)
 */
exports.findWishlistByUserId = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT 
      w.id AS wishlist_id,

      p.id AS product_id,
      p.name,
      p.slug,
      p.image_url,

      /* PRICE từ variants */
      MIN(pv.base_price) AS base_price,
      MIN(pv.sale_price) AS sale_price,

      MIN(
        CASE 
          WHEN pv.sale_price IS NOT NULL THEN pv.sale_price
          ELSE pv.base_price
        END
      ) AS min_price

    FROM wishlists w
    JOIN products p ON p.id = w.product_id

    LEFT JOIN product_variants pv 
      ON pv.product_id = p.id
      AND pv.status = 'active'

    WHERE w.user_id = ?
      AND p.is_active = 1

    GROUP BY w.id, p.id

    ORDER BY w.created_at DESC
    `,
    [userId],
  );

  return rows;
};

/**
 * CHECK tồn tại
 */
exports.findByUserAndProduct = async (userId, productId) => {
  const [[row]] = await db.execute(
    `
    SELECT 1
    FROM wishlists
    WHERE user_id = ? AND product_id = ?
    LIMIT 1
    `,
    [userId, productId],
  );

  return row;
};

/**
 * ADD
 */
exports.createWishlist = async (userId, productId) => {
  await db.execute(
    `
    INSERT IGNORE INTO wishlists (user_id, product_id)
    VALUES (?, ?)
    `,
    [userId, productId],
  );
};

/**
 * DELETE
 */
exports.deleteWishlist = async (userId, productId) => {
  await db.execute(
    `
    DELETE FROM wishlists 
    WHERE user_id = ? AND product_id = ?
    `,
    [userId, productId],
  );
};
