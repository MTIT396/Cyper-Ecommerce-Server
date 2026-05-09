const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const googleRoutes = require("./google.routes");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.use("/google", googleRoutes);

module.exports = router;
