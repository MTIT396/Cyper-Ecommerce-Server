const productService = require("../services/product.service");
const { toProductResponse } = require("../dto/product.dto");
const db = require("../config/db");
const { PRICE_RANGES } = require("../constant/priceRange");

/**
 * POST /products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const id = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: { id },
      message: "Product created",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { data, meta } = await productService.getProducts(req.query);

    res.json({
      success: true,
      data: data.map(toProductResponse),
      meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/:slug
 */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    await productService.updateProduct(req.params.id, req.body);

    res.json({
      success: true,
      message: "Product updated",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /products/:id
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    next(err);
  }
};

/** ================= FILTER ================= */

const RATING_LEVELS = [5, 4, 3, 2, 1];

exports.filterProducts = async (req, res) => {
  try {
    const { query, categoryId, rating, price, sort, brands, specs } = req.query;

    /* ================= WHERE BASE ================= */

    const where = ["p.is_active = 1"];
    const params = [];

    if (categoryId) {
      where.push("p.category_id = ?");
      params.push(Number(categoryId));
    }

    if (query) {
      where.push("p.name LIKE ?");
      params.push(`%${query}%`);
    }

    if (rating) {
      where.push("p.rating >= ?");
      params.push(Number(rating));
    }

    if (brands) {
      const brandIds = brands.split(",").map(Number);
      where.push(`p.brand_id IN (${brandIds.map(() => "?").join(",")})`);
      params.push(...brandIds);
    }

    /* ================= SPECS FILTER (BEST PRACTICE) ================= */

    if (specs) {
      const pairs = specs.split(",").map((p) => {
        const [slug, value] = p.split(":");
        return [slug, value?.toLowerCase()];
      });

      for (const [slug, value] of pairs) {
        where.push(`
          EXISTS (
            SELECT 1
            FROM product_variants pv
            JOIN variant_specs vs ON vs.variant_id = pv.id
            JOIN spec_definitions sd ON sd.id = vs.spec_id
            WHERE pv.product_id = p.id
              AND pv.status = 'active'
              AND sd.slug = ?
              AND LOWER(vs.value) = ?
          )
        `);

        params.push(slug, value);
      }
    }

    /* ================= BASE QUERY ================= */

    const baseSQL = `
      SELECT 
        p.id,
        p.rating,
        p.created_at,

        MIN(pv.base_price) AS base_price,
        MIN(pv.sale_price) AS sale_price,

        MIN(
          CASE 
            WHEN pv.sale_price IS NOT NULL THEN pv.sale_price
            ELSE pv.base_price
          END
        ) AS min_price

      FROM products p

      LEFT JOIN product_variants pv 
        ON pv.product_id = p.id
        AND pv.status = 'active'

      WHERE ${where.join(" AND ")}

      GROUP BY p.id
      HAVING min_price IS NOT NULL
    `;

    /* ================= PRICE FILTER ================= */

    let finalWhere = "";
    const finalParams = [...params];

    if (price) {
      if (price.endsWith("-up")) {
        const min = Number(price.replace("-up", ""));
        finalWhere = "WHERE fp.min_price >= ?";
        finalParams.push(min * 1_000_000);
      } else {
        const [min, max] = price.split("-").map(Number);
        finalWhere = "WHERE fp.min_price BETWEEN ? AND ?";
        finalParams.push(min * 1_000_000, max * 1_000_000);
      }
    }

    /* ================= SORT ================= */

    let orderSQL = "ORDER BY fp.created_at DESC";

    if (sort === "price_asc") orderSQL = "ORDER BY fp.min_price ASC";
    if (sort === "price_desc") orderSQL = "ORDER BY fp.min_price DESC";
    if (sort === "rating_desc") orderSQL = "ORDER BY fp.rating DESC";

    /* ================= FINAL QUERY ================= */

    const [productsRaw] = await db.execute(
      `
      SELECT 
        p.*,
        fp.min_price,
        fp.base_price,
        fp.sale_price
      FROM (${baseSQL}) fp
      JOIN products p ON p.id = fp.id
      ${finalWhere}
      ${orderSQL}
      `,
      finalParams,
    );

    /* ================= EMPTY ================= */

    if (!productsRaw.length) {
      const filters = await buildFilterMetadata({ categoryId });

      return res.json({
        success: true,
        total: 0,
        data: { products: [], filters },
      });
    }

    /* ================= COLORS ================= */

    const productIds = productsRaw.map((p) => p.id);

    const [colorRows] = await db.execute(
      `
      SELECT 
        pv.product_id,
        av.id,
        av.value,
        ANY_VALUE(c.hex_code) AS hex
      FROM product_variants pv
      JOIN variant_attributes va ON va.variant_id = pv.id
      JOIN attribute_values av ON av.id = va.attribute_value_id
      JOIN attributes a ON a.id = av.attribute_id
      LEFT JOIN colors c ON LOWER(c.name) = LOWER(av.value)
      WHERE pv.product_id IN (${productIds.map(() => "?").join(",")})
        AND a.slug = 'color'
      GROUP BY pv.product_id, av.id
      `,
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

    /* ================= FINAL RESPONSE ================= */

    const products = productsRaw.map((p) => ({
      ...toProductResponse({
        ...p,
        base_price: p.base_price ? Number(p.base_price) : null,
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        display_price: p.min_price ? Number(p.min_price) : 0,
      }),
      colors: colorMap[p.id] || [],
    }));

    /* ================= METADATA ================= */

    const filters = await buildFilterMetadata({
      categoryId,
      query,
      rating,
      brands,
      specs,
      price,
    });

    return res.json({
      success: true,
      total: products.length,
      data: {
        products,
        filters,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

/* ================= BASE QUERY ================= */
function buildBaseWhere({ categoryId, query, rating }) {
  const where = ["p.is_active = 1"];
  const params = [];

  if (categoryId) {
    where.push("p.category_id = ?");
    params.push(Number(categoryId));
  }

  if (query) {
    where.push("p.name LIKE ?");
    params.push(`%${query}%`);
  }

  if (rating) {
    where.push("p.rating >= ?");
    params.push(Number(rating));
  }

  return { where, params };
}

async function buildFilterMetadata({
  categoryId,
  query,
  rating,
  brands,
  specs,
}) {
  const { where, params } = buildBaseWhere({
    categoryId,
    query,
    rating,
  });

  /* ================= BRAND ================= */
  const brandWhere = [...where];
  const brandParams = [...params];

  // ⚠️ apply specs filter nhưng KHÔNG apply brands
  if (specs) {
    const pairs = specs.split(",").map((p) => {
      const [slug, value] = p.split(":");
      return [slug, value?.toLowerCase()];
    });

    for (const [slug, value] of pairs) {
      brandWhere.push(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          JOIN variant_specs vs ON vs.variant_id = pv.id
          JOIN spec_definitions sd ON sd.id = vs.spec_id
          WHERE pv.product_id = p.id
            AND pv.status = 'active'
            AND sd.slug = ?
            AND LOWER(vs.value) = ?
        )
      `);

      brandParams.push(slug, value);
    }
  }

  const [brandsData] = await db.execute(
    `
    SELECT DISTINCT b.id AS value, b.name AS label
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    WHERE ${brandWhere.join(" AND ")}
    `,
    brandParams,
  );

  /* ================= SPECS ================= */
  const specWhere = [...where];
  const specParams = [...params];

  // ⚠️ apply brands filter nhưng KHÔNG apply specs
  if (brands) {
    const brandIds = brands.split(",").map(Number);
    specWhere.push(`p.brand_id IN (${brandIds.map(() => "?").join(",")})`);
    specParams.push(...brandIds);
  }

  const [specsRaw] = await db.execute(
    `
    SELECT DISTINCT 
      sd.slug,
      sd.name,
      vs.value
    FROM products p
    JOIN product_variants pv 
      ON pv.product_id = p.id
      AND pv.status = 'active'
    JOIN variant_specs vs ON vs.variant_id = pv.id
    JOIN spec_definitions sd ON sd.id = vs.spec_id
    WHERE ${specWhere.join(" AND ")}
    `,
    specParams,
  );

  const specsMap = {};

  for (const row of specsRaw) {
    if (!specsMap[row.slug]) {
      specsMap[row.slug] = {
        slug: row.slug,
        name: row.name,
        values: new Map(),
      };
    }

    specsMap[row.slug].values.set(row.value.toLowerCase(), {
      value: row.value.toLowerCase(),
      label: row.value,
    });
  }

  const specsData = Object.values(specsMap).map((s) => ({
    ...s,
    values: Array.from(s.values.values()),
  }));

  /* ================= STATIC ================= */

  const price = PRICE_RANGES.map((r) => ({
    value: r.key,
    label: r.label,
  }));

  const ratingData = [5, 4, 3, 2, 1].map((r) => ({
    value: r,
    label: `${r} sao trở lên`,
  }));

  return {
    price,
    brands: brandsData,
    specs: specsData,
    rating: ratingData,
  };
}
