exports.validateCreateProduct = (req, res, next) => {
  const { name, category_id } = req.body;

  if (!name || !category_id) {
    return res.status(400).json({
      success: false,
      message: "name, category_id are required",
    });
  }

  next();
};
