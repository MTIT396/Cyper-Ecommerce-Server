const wishlistRepo = require("../repo/wishlist.repository");

/**
 * GET wishlist
 */
exports.getWishlistByUser = async (userId) => {
  const rows = await wishlistRepo.findWishlistByUserId(userId);

  return rows.map((r) => ({
    id: r.wishlist_id,
    product_id: r.product_id,
    name: r.name,
    slug: r.slug,
    image_url: r.image_url,

    base_price: r.base_price ? Number(r.base_price) : null,
    sale_price: r.sale_price ? Number(r.sale_price) : null,
    display_price: r.min_price ? Number(r.min_price) : 0,
  }));
};

/**
 * TOGGLE wishlist
 */
exports.toggleWishlist = async (userId, productId) => {
  const exists = await wishlistRepo.findByUserAndProduct(userId, productId);

  if (exists) {
    await wishlistRepo.deleteWishlist(userId, productId);
    return { isWishlisted: false };
  }

  await wishlistRepo.createWishlist(userId, productId);
  return { isWishlisted: true };
};

/**
 * CHECK
 */
exports.checkWishlist = async (userId, productId) => {
  const exists = await wishlistRepo.findByUserAndProduct(userId, productId);

  return { isWishlisted: !!exists };
};
