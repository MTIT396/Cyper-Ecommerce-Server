const router = require("express").Router();
const controller = require("../controllers/upload.controller");
const upload = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");

// Upload image (requires authentication)
router.post("/image", auth, upload.single("file"), controller.uploadImage);

// Delete image (requires authentication)
router.delete("/:publicId", auth, controller.deleteImage);

module.exports = router;
