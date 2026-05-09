const service = require("../services/cart.service");

exports.getCart = async (req, res, next) => {
  try {
    const cart = await service.getCart(req.user.id);
    res.json(cart);
  } catch (e) {
    next(e);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    await service.addItem(req.user.id, req.body);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    await service.updateItem(req.user.id, req.params.id, req.body);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    await service.removeItem(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await service.clearCart(req.user.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
