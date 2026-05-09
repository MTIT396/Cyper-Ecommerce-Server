const productService = require("../services/admin.product.service");

const productController = {
  async getAll(req, res) {
    try {
      const data = await productService.getAllProducts();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const id = await productService.createProduct(req.body);
      res.json({ id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      await productService.updateProduct(req.params.id, req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = productController;
