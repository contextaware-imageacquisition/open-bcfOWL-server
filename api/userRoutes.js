const express = require("express");
const router = express.Router();
const basicAuth = require("express-basic-auth");
const checkAuth = require("./auth/Middleware/check-auth");
const authorizer = require("./Utilities/authorizer");

const SparqlEndpoint = require("./sparql/endpointController");

router.get("/:ressource", checkAuth, SparqlEndpoint.get_user);

module.exports = router;
