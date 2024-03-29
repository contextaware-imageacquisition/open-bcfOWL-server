const express = require("express");
const router = express.Router();
const basicAuth = require("express-basic-auth");
const checkAuth = require("./auth/Middleware/check-auth");
const authorizer = require("./Utilities/authorizer");

const SparqlEndpoint = require("./sparql/endpointController");

// SPARQL routes

router.post(
  "/:projectId/query",
  checkAuth,
  SparqlEndpoint.sparql_query_endpoint
);

router.post(
  "/:projectId/update",
  checkAuth,
  SparqlEndpoint.sparql_update_endpoint
);

router.post(
  "/:projectId/user/query",
  checkAuth,
  SparqlEndpoint.sparql_query_endpoint
);

module.exports = router;
