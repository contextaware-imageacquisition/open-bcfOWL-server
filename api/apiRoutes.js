const express = require("express");
const router = express.Router();
const checkAdmin = require("./auth/Middleware/check_admin");
const checkAuth = require("./auth/Middleware/check-auth");

//const { post } = require('../Models/extensions');
const TopicsController = require("./bcf/topicsController");
const CommentController = require("./bcf/commentsController");
const ViewpointController = require("./bcf/viewpointsController");
const ExtensionsController = require("./bcf/extensionController");
const ProjectController = require("./bcf/projectsController");
const DocumentsController = require("./bcf/documentsController");
const AuthController = require("./auth/Controller/auth.js");
const UserController = require("./auth/Controller/user");

// Auth routes... temporary
router.get("/:version/current-user", UserController.current_user);
router.get("/:version/auth", AuthController.auth_get);
router.post("/:version/auth/login", AuthController.auth_login);
router.post("/:version/auth/signup", checkAdmin, AuthController.auth_signup);

// Documents
router.get(
  "/:version/projects/:projectId/documents",
  checkAuth,
  DocumentsController.get_documents
);

router.get(
  "/:version/projects/:projectId/documents/:documentId",
  checkAuth,
  DocumentsController.get_document
);

router.post(
  "/:version/projects/:projectId/documents",
  checkAuth,
  DocumentsController.post_document
);

router.put(
  "/:version/projects/:projectId/documents/:documentId/spatial_representation",
  checkAuth,
  DocumentsController.post_spatial
);

router.get(
  "/:version/projects/:projectId/documents/:documentId/spatial_representation",
  checkAuth,
  DocumentsController.get_spatial
);

// Query specific project server with sparql
// router.post("/:projectId/");

// Projects

router.get("/:version/projects", checkAuth, ProjectController.get_projects);
router.post("/:version/projects", checkAuth, ProjectController.post_project);

// Extensions

router.get(
  "/:version/projects/:projectId/extensions",
  checkAuth,
  ExtensionsController.get_extensions
);

router.post(
  "/:version/projects/:projectId/extensions",
  checkAuth,
  ExtensionsController.post_extensions
);

// Files

router.get(
  "/:version/projects/:projectId/files_information",
  checkAuth,
  ExtensionsController.post_extensions
);

router.get("/:version/projects/:projectId/topics/:topicId/files", checkAuth);

router.put("/:version/projects/:projectId/topics/:topicId/files", checkAuth);

// Topics
router.get(
  "/:version/projects/:projectId/topics",
  checkAuth,
  TopicsController.get_all_topics
);

router.get(
  "/:version/projects/:projectId/topics/:topicId",
  checkAuth,
  TopicsController.get_topic
);

router.post(
  "/:version/projects/:projectId/topics",
  checkAuth,
  TopicsController.post_topic
);

router.put(
  "/:version/projects/:projectId/topics/:topicId",
  checkAuth,
  TopicsController.put_topic
);

// Document References

router.post(
  "/:version/projects/:projectId/topics/:topicId/document_references",
  checkAuth,
  DocumentsController.post_documentRefs
);

router.get(
  "/:version/projects/:projectId/topics/:topicId/document_references",
  checkAuth,
  DocumentsController.get_documentRefs
);

router.get(
  "/:version/projects/:projectId/document_references",
  checkAuth,
  DocumentsController.get_all_documentRefs
);

// Comments
router.get(
  "/:version/projects/:projectId/comments",
  checkAuth,
  CommentController.get_all_comments
);

router.get(
  "/:version/projects/:projectId/topics/:topicId/comments",
  checkAuth,
  CommentController.get_all_topic_comments
);

router.get(
  "/:version/projects/:projectId/topics/:topicId/comments/:commentId",
  checkAuth,
  CommentController.get_comment
);

router.post(
  "/:version/projects/:projectId/topics/:topicId/comments/",
  checkAuth,
  CommentController.post_comment
);

router.put(
  "/:version/projects/:projectId/topics/:topicId/comments/:commentId",
  checkAuth,
  CommentController.put_comment
);

// Viewpoints
router.get(
  "/:version/projects/:projectId/viewpoints",
  checkAuth,
  ViewpointController.get_all_viewpoints
);

router.get(
  "/:version/projects/:projectId/topics/:topicId/viewpoints",
  checkAuth,
  ViewpointController.get_all_topic_viewpoints
);

router.get(
  "/:version/projects/:projectId/topics/:topicId/viewpoints/:viewpointId",
  checkAuth,
  ViewpointController.get_viewpoint
);

router.post(
  "/:version/projects/:projectId/topics/:topicId/viewpoints/",
  checkAuth,
  ViewpointController.post_viewpoint
);

router.get(
  "/:version/projects/:projectId/topics/:topicId/viewpoints/:viewpointId/snapshot",
  checkAuth,
  ViewpointController.get_snapshot
);

module.exports = router;
