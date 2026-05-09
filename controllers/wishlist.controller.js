const wishlistService = require("../services/wishlist.service");

// GET
exports.getMyWishlist = async (req, res, next) => {
  try {
    const data = await wishlistService.getWishlistByUser(req.user.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// TOGGLE
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const result = await wishlistService.toggleWishlist(req.user.id, productId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// CHECK
exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await wishlistService.checkWishlist(req.user.id, productId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
