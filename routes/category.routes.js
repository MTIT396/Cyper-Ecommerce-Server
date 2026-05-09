const express = require("express");
const controller = require("../controllers/category.controller");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:slug", controller.getBySlug);

module.exports = router;
