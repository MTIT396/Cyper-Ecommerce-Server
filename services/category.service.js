const repo = require("../repo/category.repository");

exports.getBySlug = async (slug) => {
  const category = await repo.findBySlug(slug);
  if (!category) throw new Error("CATEGORY_NOT_FOUND");
  return category;
};

exports.getAll = async () => {
  return repo.findAll();
};
