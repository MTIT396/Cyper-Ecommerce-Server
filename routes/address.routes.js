const express = require("express");
const router = express.Router();
const controller = require("../controllers/address.controller");
const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.get("/", controller.getMyAddresses);
router.get("/:id", controller.getAddressById);
router.post("/", controller.createAddress);
router.put("/:id", controller.updateAddress);
router.patch("/:id/default", controller.setDefaultAddress);
router.delete("/:id", controller.deleteAddress);

module.exports = router;
