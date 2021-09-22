const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./bcfAPI.json");
const basicAuth = require("express-basic-auth");
const checkAdmin = require("./auth/Middleware/check_admin");
const checkAuth = require("./auth/Middleware/check-auth");
const authorizer = require("./Utilities/authorizer");

//const { post } = require('../Models/extensions');
const TopicsController = require("./bcf/topicsController");
const SparqlEndpoint = require("./sparql/endpointController");
const CommentController = require("./bcf/commentsController");
const ViewpointController = require("./bcf/viewpointsController");
const ExtensionsController = require("./bcf/extensionController");
const ProjectController = require("./bcf/projectsController");
const DocumentsController = require("./bcf/documentsController");
const AuthController = require("./auth/Controller/auth.js");
const UserController = require("./auth/Controller/user");

// Swagger

router.get("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// SPARQL routes

router.post(
  "/sparql/:projectId/query",
  checkAuth,
  SparqlEndpoint.sparql_query_endpoint
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
  SparqlEndpoint.get_project
);

// Auth routes... temporary
router.get("/bcf/:version/current-user", UserController.current_user);
router.get("/bcf/:version/auth", AuthController.auth_get);
router.post("/bcf/:version/auth/login", AuthController.auth_login);
router.post(
  "/bcf/:version/auth/signup",
  checkAdmin,
  AuthController.auth_signup
);

// Documents
router.get(
  "/bcf/:version/projects/:projectId/documents",
  checkAuth,
  DocumentsController.get_documents
);

router.get(
  "/bcf/:version/projects/:projectId/documents/:documentId",
  checkAuth,
  DocumentsController.get_document
);

router.post(
  "/bcf/:version/projects/:projectId/documents",
  checkAuth,
  DocumentsController.post_document
);

router.put(
  "/bcf/:version/projects/:projectId/documents/:documentId/spatial_representation",
  checkAuth,
  DocumentsController.post_spatial
);

router.get(
  "/bcf/:version/projects/:projectId/documents/:documentId/spatial_representation",
  checkAuth,
  DocumentsController.get_spatial
);

// Query specific project server with sparql
// router.post("/:projectId/");

// Projects

router.get("/bcf/:version/projects", checkAuth, ProjectController.get_projects);
router.post(
  "/bcf/:version/projects",
  checkAuth,
  ProjectController.post_project
);

// Extensions

router.get(
  "/bcf/:version/projects/:projectId/extensions",
  checkAuth,
  ExtensionsController.get_extensions
);
router.post(
  "/bcf/:version/projects/:projectId/extensions",
  checkAuth,
  ExtensionsController.post_extensions
);

// Topics
router.get(
  "/bcf/:version/projects/:projectId/topics",
  checkAuth,
  TopicsController.get_all_topics
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId",
  checkAuth,
  TopicsController.get_topic
);

router.post(
  "/bcf/:version/projects/:projectId/topics",
  checkAuth,
  TopicsController.post_topic
);

router.put(
  "/bcf/:version/projects/:projectId/topics/:topicId",
  checkAuth,
  TopicsController.put_topic
);

// Document References

router.post(
  "/bcf/:version/projects/:projectId/topics/:topicId/document_references",
  checkAuth,
  DocumentsController.post_documentRefs
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId/document_references",
  checkAuth,
  DocumentsController.get_documentRefs
);

router.get(
  "/bcf/:version/projects/:projectId/document_references",
  checkAuth,
  DocumentsController.get_all_documentRefs
);

// Comments
router.get(
  "/bcf/:version/projects/:projectId/comments",
  checkAuth,
  CommentController.get_all_comments
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId/comments",
  checkAuth,
  CommentController.get_all_topic_comments
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId/comments/:commentId",
  checkAuth,
  CommentController.get_comment
);

router.post(
  "/bcf/:version/projects/:projectId/topics/:topicId/comments/",
  checkAuth,
  CommentController.post_comment
);

router.put(
  "/bcf/:version/projects/:projectId/topics/:topicId/comments/:commentId",
  checkAuth,
  CommentController.put_comment
);

// Viewpoints
router.get(
  "/bcf/:version/projects/:projectId/viewpoints",
  checkAuth,
  ViewpointController.get_all_viewpoints
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId/viewpoints",
  checkAuth,
  ViewpointController.get_all_topic_viewpoints
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId/viewpoints/:viewpointId",
  checkAuth,
  ViewpointController.get_viewpoint
);

router.post(
  "/bcf/:version/projects/:projectId/topics/:topicId/viewpoints/",
  checkAuth,
  ViewpointController.post_viewpoint
);

router.get(
  "/bcf/:version/projects/:projectId/topics/:topicId/viewpoints/:viewpointId/snapshot",
  checkAuth,
  ViewpointController.get_snapshot
);

module.exports = router;
