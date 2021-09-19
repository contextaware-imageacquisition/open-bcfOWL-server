const express = require("express");
const router = express.Router();

const checkAdmin = require("./auth/Middleware/check_admin");
const checkAuth = require("./auth/Middleware/check-auth");

//const { post } = require('../Models/extensions');
const TopicsController = require("./sparql/sparql-topics");
const SparqlEndpoint = require("./sparql/sparql-endpoint");
const CommentController = require("./sparql/sparql-comments");
const ViewpointController = require("./sparql/sparql-viewpoints");
const ExtensionsController = require("./sparql/sparql-extension");
const ProjectController = require("./sparql/sparql-projects");
const DocumentsController = require("./sparql/sparql-documents");
const AuthController = require("./auth/Controller/auth.js");
const UserController = require("./auth/Controller/user");

// Auth routes... temporary
router.get("/current-user", UserController.current_user);
router.get("/auth", AuthController.auth_get);
router.post("/auth/login", AuthController.auth_login);
router.post("/auth/signup", checkAdmin, AuthController.auth_signup);

// Query main server with sparql
router.post("/query", checkAuth, SparqlEndpoint.sparql_query_endpoint);

// Documents
router.get(
  "/projects/:projectId/documents",
  checkAuth,
  DocumentsController.get_documents
);

router.get(
  "/projects/:projectId/documents/:documentId",
  checkAuth,
  DocumentsController.get_document
);

router.post(
  "/projects/:projectId/documents",
  checkAuth,
  DocumentsController.post_document
);

router.post(
  "/projects/:projectId/documents/:documentId/spatial_representation",
  checkAuth,
  DocumentsController.post_spatial
);

router.get(
  "/projects/:projectId/documents/:documentId/spatial_representation",
  checkAuth,
  DocumentsController.get_spatial
);

// Query specific project server with sparql
// router.post("/:projectId/");

// Projects

router.get("/projects", checkAuth, ProjectController.get_projects);
router.post("/projects", checkAuth, ProjectController.post_project);

// Extensions

router.get(
  "/projects/:projectId/extensions",
  checkAuth,
  ExtensionsController.get_extensions
);
router.post(
  "/projects/:projectId/extensions",
  checkAuth,
  ExtensionsController.post_extensions
);

// Topics
router.get(
  "/projects/:projectId/topics",
  checkAuth,
  TopicsController.get_all_topics
);

router.get(
  "/projects/:projectId/topics/:topicId",
  checkAuth,
  TopicsController.get_topic
);

router.post(
  "/projects/:projectId/topics",
  checkAuth,
  TopicsController.post_topic
);

router.put(
  "/projects/:projectId/topics/:topicId",
  checkAuth,
  TopicsController.put_topic
);

// Comments
router.get(
  "/projects/:projectId/comments",
  checkAuth,
  CommentController.get_all_comments
);

router.get(
  "/projects/:projectId/topics/:topicId/comments",
  checkAuth,
  CommentController.get_all_topic_comments
);

router.get(
  "/projects/:projectId/topics/:topicId/comments/:commentId",
  checkAuth,
  CommentController.get_comment
);

router.post(
  "/projects/:projectId/topics/:topicId/comments/",
  checkAuth,
  CommentController.post_comment
);

router.put(
  "/projects/:projectId/topics/:topicId/comments/:commentId",
  checkAuth,
  CommentController.put_comment
);

// Viewpoints
router.get(
  "/projects/:projectId/viewpoints",
  checkAuth,
  ViewpointController.get_all_viewpoints
);

router.get(
  "/projects/:projectId/topics/:topicId/viewpoints",
  checkAuth,
  ViewpointController.get_all_topic_viewpoints
);

router.get(
  "/projects/:projectId/topics/:topicId/viewpoints/:viewpointId",
  checkAuth,
  ViewpointController.get_viewpoint
);

router.post(
  "/projects/:projectId/topics/:topicId/viewpoints/",
  checkAuth,
  ViewpointController.post_viewpoint
);

module.exports = router;
