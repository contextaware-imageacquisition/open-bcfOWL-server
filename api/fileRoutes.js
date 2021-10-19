const express = require("express");
const router = express.Router();
const checkAdmin = require("./auth/Middleware/check_admin");
const checkAuth = require("./auth/Middleware/check-auth");

//const { post } = require('../Models/extensions');
const FileController = require("./files/filesController");

router.get("/:projectId/:ressource", checkAuth, FileController.get_file);

module.exports = router;
