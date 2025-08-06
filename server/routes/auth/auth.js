const express = require('express');
const router = express.Router();
const middleware = require("../../middleware/authMiddleware")
const controller = require("../../controllers/auth.controller")


// Public routes (no authentication required)
router.post("/login", controller.loginAdmin.bind(controller));
router.post("/reset-password", controller.resetAdminPassword.bind(controller));

module.exports = router;