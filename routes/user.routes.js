const router = require("express").Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/me", auth, controller.getMe);
router.put("/me", auth, controller.updateMe);
router.put("/me/password", auth, controller.changePassword);
router.patch(
  "/me/profile",
  auth,
  upload.single("file"),
  controller.updateProfileWithAvatar,
);

// admin
router.get("/", auth, role("admin"), controller.getUsers);
router.get("/:id", auth, role("admin"), controller.getUserById);

module.exports = router;
