const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, wishlistController.getMyWishlist);

router.post("/toggle", auth, wishlistController.toggleWishlist);

router.get("/check/:productId", auth, wishlistController.checkWishlist);

module.exports = router;
