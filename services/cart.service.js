const repo = require("../repo/cart.repository");
const AppError = require("../utils/AppError");

/* ================= GET CART ================= */

exports.getCart = async (userId) => {
  const cart = await repo.getActiveCart(userId);
  if (!cart) throw new AppError("Cart not found", 404);

  const rows = await repo.getItems(cart.id);

  const map = {};

  for (const r of rows) {
    if (!map[r.cart_item_id]) {
      map[r.cart_item_id] = {
        id: r.cart_item_id,
        product_id: r.product_id,
        name: r.product_name,
        slug: r.product_slug,
        quantity: r.quantity,
        price: Number(r.price),
        image_url: r.image_url,

        variant: r.variant_id
          ? {
              id: r.variant_id,
              sku: r.sku,
              attributes: [],
              color: null,
            }
          : null,
      };
    }

    if (!r.attribute_id || !map[r.cart_item_id].variant) continue;

    const attr = {
      id: r.attribute_id,
      name: r.attribute_name,
      slug: r.attribute_slug,
      value: r.attribute_value,
    };

    map[r.cart_item_id].variant.attributes.push(attr);

    if (r.attribute_slug === "color") {
      map[r.cart_item_id].variant.color = {
        id: r.color_id || null,
        name: r.attribute_value,
        hex_code: r.hex_code || null,
      };
    }
  }

  const items = Object.values(map);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    id: cart.id,
    items,
    total,
  };
};

/* ================= ADD ITEM ================= */

exports.addItem = async (userId, { product_id, variant_id, quantity }) => {
  const cart = await repo.getActiveCart(userId);
  if (!cart) throw new AppError("Cart not found", 404);

  if (!variant_id) {
    throw new AppError("Variant is required", 422);
  }

  const variant = await repo.getVariant(variant_id);
  if (!variant) throw new AppError("Variant not found", 404);

  if (variant.product_id !== product_id) {
    throw new AppError("Variant does not belong to product", 409);
  }

  if (variant.stock < quantity) {
    throw new AppError("Not enough stock", 409);
  }

  const price =
    variant.sale_price != null
      ? Number(variant.sale_price)
      : Number(variant.base_price);

  const existed = await repo.findItem(cart.id, product_id, variant_id);

  if (existed) {
    await repo.updateQuantity(existed.id, existed.quantity + quantity);
  } else {
    await repo.addItem({
      cart_id: cart.id,
      product_id,
      variant_id,
      quantity,
      price,
    });
  }
};

/* ================= UPDATE ITEM ================= */

exports.updateItem = async (userId, itemId, { quantity }) => {
  if (quantity <= 0) {
    throw new AppError("Quantity must be greater than 0", 422);
  }

  const item = await repo.getItemById(itemId, userId);
  if (!item) throw new AppError("Item not found", 404);

  const variant = await repo.getVariant(item.variant_id);
  if (!variant) throw new AppError("Variant not found", 404);

  if (variant.stock < quantity) {
    throw new AppError("Not enough stock", 409);
  }

  await repo.updateQuantity(itemId, quantity);
};

/* ================= REMOVE ITEM ================= */

exports.removeItem = async (userId, itemId) => {
  const item = await repo.getItemById(itemId, userId);
  if (!item) throw new AppError("Item not found", 404);

  await repo.removeItem(itemId);
};

/* ================= CLEAR CART ================= */

exports.clearCart = async (userId) => {
  const cart = await repo.getActiveCart(userId);
  if (!cart) return;

  await repo.clearCart(cart.id);
};
