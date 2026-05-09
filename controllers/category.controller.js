const service = require("../services/category.service");

exports.getBySlug = async (req, res, next) => {
  try {
    const data = await service.getBySlug(req.params.slug);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
};
