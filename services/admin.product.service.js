const db = require("../config/db");
const productRepo = require("../repo/admin.product.repository");

const productService = {
  async createProduct(data) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const productId = await productRepo.createProduct(conn, data);

      for (const v of data.variants || []) {
        const variantId = await productRepo.createVariant(conn, productId, v);

        if (v.images?.length) {
          await productRepo.createImages(conn, variantId, v.images);
        }

        if (v.attributes?.length) {
          await productRepo.createAttributes(conn, variantId, v.attributes);
        }
      }

      await conn.commit();
      return productId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateProduct(id, data) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await productRepo.updateProduct(conn, id, data);

      await productRepo.deleteAllRelations(conn, id);

      for (const v of data.variants || []) {
        const variantId = await productRepo.createVariant(conn, id, v);

        if (v.images?.length) {
          await productRepo.createImages(conn, variantId, v.images);
        }

        if (v.attributes?.length) {
          await productRepo.createAttributes(conn, variantId, v.attributes);
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async deleteProduct(id) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await productRepo.deleteAllRelations(conn, id);
      await productRepo.deleteProduct(conn, id);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getAllProducts() {
    const rows = await productRepo.getAll();

    const map = {};

    rows.forEach((r) => {
      if (!map[r.id]) {
        map[r.id] = {
          id: r.id,
          name: r.name,
          variants: [],
        };
      }

      if (r.variant_id) {
        let variant = map[r.id].variants.find((v) => v.id === r.variant_id);

        if (!variant) {
          variant = {
            id: r.variant_id,
            sku: r.sku,
            stock: r.stock,
            color_id: r.color_id,
            images: [],
            attributes: [],
          };
          map[r.id].variants.push(variant);
        }

        if (r.image_url && !variant.images.includes(r.image_url)) {
          variant.images.push(r.image_url);
        }

        if (r.attribute_value_id) {
          variant.attributes.push({
            attribute_value_id: r.attribute_value_id,
            attribute_id: r.attribute_id,
            value: r.value,
          });
        }
      }
    });

    return Object.values(map);
  },
};

module.exports = productService;
