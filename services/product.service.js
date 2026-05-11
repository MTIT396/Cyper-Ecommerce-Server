const db = require("../config/db");

/**
 * CREATE
 */
exports.createProduct = async ({ name, slug, description, category_id }) => {
  const [result] = await db.execute(
    `INSERT INTO products (name, slug, description, category_id)
     VALUES (?, ?, ?, ?)`,
    [name, slug, description, category_id],
  );

  return result.insertId;
};

/**
 * READ (Pagination + Filter)
 */

exports.getProducts = async ({
  page = 1,
  limit = 20,
  category_id,
  type = "new",
}) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const offset = (page - 1) * limit;

  let where = "WHERE p.is_active = TRUE";
  let params = [];

  if (category_id) {
    where += " AND p.category_id = ?";
    params.push(category_id);
  }

  let orderBy = "p.created_at DESC";
  if (type === "bestseller") orderBy = "total_sold DESC";
  if (type === "featured") orderBy = "p.rating DESC";

  const [[rows], [[{ total }]]] = await Promise.all([
    db.execute(
      `SELECT 
    p.id, p.name, p.slug, p.image_url,
    p.category_id, p.brand_id, p.rating,
    p.created_at, p.updated_at,
    MIN(pv.base_price) AS base_price,
    MIN(pv.sale_price) AS sale_price,
    MIN(
      CASE 
        WHEN pv.sale_price IS NOT NULL
        THEN pv.sale_price
        ELSE pv.base_price
      END
    ) AS display_price,
    SUM(pv.sold_count) AS total_sold
  FROM products p
  LEFT JOIN product_variants pv
    ON pv.product_id = p.id
    AND pv.status = 'active'
  ${where}
  GROUP BY p.id
  ORDER BY ${orderBy}
  LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),

    db.execute(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM products p
       LEFT JOIN product_variants pv
         ON pv.product_id = p.id AND pv.status = 'active'
       ${where}`,
      params,
    ),
  ]);

  // ─── Colors  ───────────────────────────────────────────────────
  if (!rows.length) {
    return { data: [], meta: buildMeta(0, page, limit) };
  }

  const productIds = rows.map((p) => p.id);

  const [colorRows] = await db.execute(
    `SELECT 
      pv.product_id,
      av.id AS id,
      av.value,
      ANY_VALUE(c.hex_code) AS hex
    FROM product_variants pv
    JOIN variant_attributes va  ON va.variant_id = pv.id
    JOIN attribute_values av    ON av.id = va.attribute_value_id
    JOIN attributes a           ON a.id = av.attribute_id
    LEFT JOIN colors c          ON LOWER(c.name) = LOWER(av.value)
    WHERE pv.product_id IN (${productIds.map(() => "?").join(",")})
      AND a.slug = 'color'
    GROUP BY pv.product_id, av.id`,
    productIds,
  );

  const colorMap = {};
  for (const row of colorRows) {
    if (!colorMap[row.product_id]) colorMap[row.product_id] = [];
    colorMap[row.product_id].push({
      id: row.id,
      value: row.value,
      hex_code: row.hex || null,
    });
  }

  const data = rows.map((p) => ({
    ...p,
    total_sold: Number(p.total_sold) || 0,
    colors: colorMap[p.id] || [],
  }));

  return { data, meta: buildMeta(total, page, limit) };
};

// ─── Helper ────────────────────────────────────────────────────────────────
function buildMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

/**
 * READ BY Slug
 */

exports.getProductBySlug = async (slug) => {
  /* ================= PRODUCT ================= */
  const [[product]] = await db.execute(
    `
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.category_id,
    p.description,
    p.rating,
    p.brand_id,

    MIN(pv.base_price) AS base_price,
    MIN(pv.sale_price) AS sale_price,

    MIN(
      CASE 
        WHEN pv.sale_price IS NOT NULL THEN pv.sale_price
        ELSE pv.base_price
      END
    ) AS display_price

  FROM products p
  LEFT JOIN product_variants pv ON pv.product_id = p.id

  WHERE p.slug = ? AND p.is_active = 1
  GROUP BY p.id
  LIMIT 1
  `,
    [slug],
  );

  if (!product) return null;

  /* ================= COMMON IMAGES ================= */
  const [commonImages] = await db.execute(
    `
    SELECT image_url
    FROM product_images
    WHERE product_id = ? AND variant_id IS NULL
    `,
    [product.id],
  );

  const commonImageUrls = commonImages.map((i) => i.image_url);

  /* ================= BRAND ================= */
  const [[brand]] = await db.execute(
    `SELECT id, name FROM brands WHERE id = ?`,
    [product.brand_id],
  );

  /* ================= VARIANTS ================= */
  const [variantRows] = await db.execute(
    `
    SELECT id, sku, stock, base_price, sale_price, sold_count
    FROM product_variants
    WHERE product_id = ? AND status = 'active'
    `,
    [product.id],
  );

  if (variantRows.length === 0) {
    return {
      ...product,
      images: commonImageUrls,
      variants: [],
      variant_attributes: [],
      brand: brand || null,
    };
  }

  const variantIds = variantRows.map((v) => v.id);

  /* ================= ATTRIBUTES + COLOR HEX ================= */
  const [attributeRows] = await db.execute(
    `
    SELECT
      va.variant_id,
      a.id   AS attribute_id,
      a.name AS attribute_name,
      a.slug AS attribute_slug,
      av.id  AS value_id,
      av.value,
      c.hex_code
    FROM variant_attributes va
    JOIN attribute_values av ON av.id = va.attribute_value_id
    JOIN attributes a ON a.id = av.attribute_id
    LEFT JOIN colors c 
      ON LOWER(c.name) = LOWER(av.value)
    WHERE va.variant_id IN (${variantIds.map(() => "?").join(",")})
    `,
    variantIds,
  );

  /* ================= VARIANT SPECS ================= */
  const [specRows] = await db.execute(
    `
    SELECT
      vs.variant_id,
      sd.name AS spec_name,
      vs.value
    FROM variant_specs vs
    JOIN spec_definitions sd ON sd.id = vs.spec_id
    WHERE vs.variant_id IN (${variantIds.map(() => "?").join(",")})
    `,
    variantIds,
  );

  /* ================= VARIANT IMAGES ================= */
  const [variantImages] = await db.execute(
    `
    SELECT variant_id, image_url
    FROM product_images
    WHERE variant_id IN (${variantIds.map(() => "?").join(",")})
    `,
    variantIds,
  );

  /* ================= BUILD VARIANTS ================= */
  const variantsMap = {};

  for (const v of variantRows) {
    variantsMap[v.id] = {
      id: v.id,
      sku: v.sku,
      stock: v.stock,
      sold: v.sold_count,
      base_price: Number(v.base_price),
      sale_price: v.sale_price ? Number(v.sale_price) : null,
      attribute_values: [],
      specs: [],
      images: [],
    };
  }

  /* ================= ATTACH ATTRIBUTES ================= */
  for (const row of attributeRows) {
    variantsMap[row.variant_id].attribute_values.push({
      attribute_id: row.attribute_id,
      attribute_name: row.attribute_name,
      attribute_slug: row.attribute_slug,

      value_id: row.value_id,
      value: row.value,
      meta:
        row.attribute_slug === "color"
          ? { hex: row.hex_code || null }
          : undefined,
    });
  }

  /* ================= ATTACH SPECS ================= */
  for (const row of specRows) {
    variantsMap[row.variant_id].specs.push({
      name: row.spec_name,
      value: row.value,
    });
  }

  /* ================= ATTACH IMAGES ================= */
  for (const img of variantImages) {
    variantsMap[img.variant_id].images.push(img.image_url);
  }

  /* ================= FINAL VARIANTS ================= */
  const variants = Object.values(variantsMap).map((v) => ({
    ...v,
    images: v.images || [],
  }));

  /* ================= BUILD ATTRIBUTE FILTER ================= */
  const attributeMap = {};

  for (const v of variants) {
    for (const attr of v.attribute_values) {
      if (!attributeMap[attr.attribute_id]) {
        attributeMap[attr.attribute_id] = {
          id: attr.attribute_id,
          name: attr.attribute_name,
          slug: attr.attribute_slug,
          values: new Map(),
        };
      }

      attributeMap[attr.attribute_id].values.set(attr.value_id, {
        id: attr.value_id,
        value: attr.value,
        ...(attr.meta ? { meta: attr.meta } : {}),
      });
    }
  }

  const variant_attributes = Object.values(attributeMap).map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    values: Array.from(a.values.values()),
  }));

  /* ================= FINAL RESPONSE ================= */
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    rating: product.rating,
    category_id: product.category_id,

    images: commonImageUrls,

    variant_attributes, // dùng cho FE chọn
    variants, // SKU + specs

    brand: brand || null,
  };
};
/**
 * UPDATE
 */
exports.updateProduct = async (id, data) => {
  const { name, description, category_id, is_active } = data;

  await db.execute(
    `
    UPDATE products
    SET name = ?, description = ?, category_id = ?, is_active = ?
    WHERE id = ?
    `,
    [name, description, category_id, is_active, id],
  );
};

/**
 * SOFT DELETE
 */
exports.deleteProduct = async (id) => {
  await db.execute(
    `
    UPDATE products
    SET is_active = FALSE
    WHERE id = ?
    `,
    [id],
  );
};
