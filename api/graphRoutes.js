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

router.post("/user/query", checkAuth, SparqlEndpoint.sparql_query_endpoint);

router.get(
  "/users/:ressource",
  basicAuth({
    authorizer: authorizer.authorizer,
    authorizeAsync: true,
    challenge: true,
  }),
  SparqlEndpoint.get_user
);

//TODO Ressources must be split by / ... not by #!
router.get(
  "/:projectId/:ressource",
  basicAuth({
    authorizer: authorizer.authorizer,
    authorizeAsync: true,
    challenge: true,
  }),
  SparqlEndpoint.get_ressource
);

router.get(
  "/:projectId",
  basicAuth({
    authorizer: authorizer.authorizer,
    authorizeAsync: true,
    challenge: true,
  }),
  SparqlEndpoint.get_graph
);

module.exports = router;
