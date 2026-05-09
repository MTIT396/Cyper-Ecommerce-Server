exports.toProductResponse = (product) => ({
  id: product.id,
  name: product.name,
  rating: product.rating,
  slug: product.slug,
  base_price: product.base_price,
  sale_price: product.sale_price,
  image_url: product.image_url,
  description: product.description,
  category_id: product.category_id,
  is_active: product.is_active,
  created_at: product.created_at,
  colors: product.colors,
});
