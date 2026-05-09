const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const { validateCreateProduct } = require("../middlewares/validate.middleware");

// [POST]
router.post("/", validateCreateProduct, controller.createProduct);
// [GET]
router.get("/", controller.getProducts);
router.get("/filter", controller.filterProducts);
router.get("/:slug", controller.getProductBySlug);

// [PUT]
router.put("/:id", controller.updateProduct);
// [DELETE]
router.delete("/:id", controller.deleteProduct);

module.exports = router;
