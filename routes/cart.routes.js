const router = require("express").Router();
const controller = require("../controllers/cart.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, controller.getCart);
router.post("/items", auth, controller.addItem);
router.put("/items/:id", auth, controller.updateItem);
router.delete("/items/:id", auth, controller.removeItem);
router.delete("/clear", auth, controller.clearCart);

module.exports = router;
