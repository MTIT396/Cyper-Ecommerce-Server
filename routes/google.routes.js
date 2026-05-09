const router = require("express").Router();
const controller = require("../controllers/google.controller");

router.get("/callback", controller.googleLogin);

module.exports = router;
