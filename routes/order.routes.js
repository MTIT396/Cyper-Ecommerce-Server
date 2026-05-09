const router = require("express").Router();

const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, orderController.createOrder);
router.get("/", auth, orderController.getOrders);
router.get("/:id", auth, orderController.getOrderDetail);
router.patch("/:id/cancel", auth, orderController.cancelOrder);

module.exports = router;
