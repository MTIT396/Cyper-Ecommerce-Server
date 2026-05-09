const db = require("../config/db");

exports.findBySlug = async (slug) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, parent_id FROM categories WHERE slug = ? LIMIT 1",
    [slug]
  );
  return rows[0];
};

exports.findAll = async () => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, parent_id FROM categories"
  );
  return rows;
};
