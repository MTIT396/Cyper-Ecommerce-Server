const productRepo = {
  async createProduct(conn, data) {
    const [res] = await conn.query(
      `INSERT INTO products (name, description, base_price, sale_price)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.description, data.base_price, data.sale_price],
    );
    return res.insertId;
  },

  async createVariant(conn, productId, v) {
    const [res] = await conn.query(
      `INSERT INTO product_variants 
      (product_id, sku, base_price, sale_price, stock, color_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, v.sku, v.base_price, v.sale_price, v.stock, v.color_id],
    );
    return res.insertId;
  },

  async createImages(conn, variantId, images) {
    const values = images.map((img) => [variantId, img]);
    await conn.query(
      `INSERT INTO product_images (variant_id, image_url) VALUES ?`,
      [values],
    );
  },

  async createAttributes(conn, variantId, attrs) {
    const values = attrs.map((a) => [variantId, a.attribute_value_id]);

    await conn.query(
      `INSERT INTO variant_attributes (variant_id, attribute_value_id)
       VALUES ?`,
      [values],
    );
  },

  async deleteAllRelations(conn, productId) {
    const [variants] = await conn.query(
      `SELECT id FROM product_variants WHERE product_id=?`,
      [productId],
    );

    const ids = variants.map((v) => v.id);

    if (ids.length) {
      await conn.query(`DELETE FROM product_images WHERE variant_id IN (?)`, [
        ids,
      ]);
      await conn.query(
        `DELETE FROM variant_attributes WHERE variant_id IN (?)`,
        [ids],
      );
    }

    await conn.query(`DELETE FROM product_variants WHERE product_id=?`, [
      productId,
    ]);
  },

  async updateProduct(conn, id, data) {
    await conn.query(
      `UPDATE products SET name=?, description=?, base_price=?, sale_price=? WHERE id=?`,
      [data.name, data.description, data.base_price, data.sale_price, id],
    );
  },

  async deleteProduct(conn, id) {
    await conn.query(`DELETE FROM products WHERE id=?`, [id]);
  },

  async getAll() {
    const db = require("../config/db");
    const [rows] = await db.query(`
  SELECT 
    p.*,
    v.id as variant_id, v.sku, v.stock, v.color_id,
    i.image_url,

    av.id as attribute_value_id,
    av.value,
    av.attribute_id

  FROM products p
  LEFT JOIN product_variants v ON p.id = v.product_id
  LEFT JOIN product_images i ON v.id = i.variant_id

  LEFT JOIN variant_attributes va ON v.id = va.variant_id
  LEFT JOIN attribute_values av ON va.attribute_value_id = av.id

  ORDER BY p.id DESC
`);

    return rows;
  },
};

module.exports = productRepo;
