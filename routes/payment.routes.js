const express = require("express");
const controller = require("../controllers/payment.controller");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/momo", auth, controller.createMomo);
router.post("/momo/callback", controller.momoCallback);
router.post(
  "/momo/transaction-status",
  auth,
  controller.checkTransactionStatus,
);

module.exports = router;
