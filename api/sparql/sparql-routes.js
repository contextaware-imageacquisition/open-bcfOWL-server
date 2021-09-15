const express = require("express");
const router = express.Router();

//const { post } = require('../Models/extensions');
const TopicsController = require("./sparql-topics");
const SparqlEndpoint = require("./sparql-endpoint");
const CommentController = require("./sparql-comments");
const ViewpointController = require("./sparql-viewpoints");
const ExtensionsController = require("./sparql-extension");
const ProjectController = require("./sparql-projects");

// Query main server with sparql
router.post("/", SparqlEndpoint.sparql_query_endpoint);

// Query specific project server with sparql
router.post("/:projectId/");

// Projects

router.get("/projects", ProjectController.get_projects);
router.post("/projects", ProjectController.post_project);

// Extensions

router.get(
  "/projects/:projectId/extensions",
  ExtensionsController.get_extensions
);
router.post(
  "/projects/:projectId/extensions",
  ExtensionsController.post_extensions
);

// Topics
router.get("/projects/:projectId/topics", TopicsController.get_all_topics);

router.get("/projects/:projectId/topics/:topicId", TopicsController.get_topic);

router.post("/projects/:projectId/topics", TopicsController.post_topic);

router.put("/projects/:projectId/topics/:topicId", TopicsController.put_topic);

// Comments
router.get("/projects/:projectId/comments", CommentController.get_all_comments);

router.get(
  "/projects/:projectId/topics/:topicId/comments",
  CommentController.get_all_topic_comments
);

router.get(
  "/projects/:projectId/topics/:topicId/comments/:commentId",
  CommentController.get_comment
);

router.post(
  "/projects/:projectId/topics/:topicId/comments/",
  CommentController.post_comment
);

router.put(
  "/projects/:projectId/topics/:topicId/comments/:commentId",
  CommentController.put_comment
);

// Viewpoints
router.get(
  "/projects/:projectId/viewpoints",
  ViewpointController.get_all_viewpoints
);

router.get(
  "/projects/:projectId/topics/:topicId/viewpoints",
  ViewpointController.get_all_topic_viewpoints
);

router.get(
  "/projects/:projectId/topics/:topicId/viewpoints/:viewpointId",
  ViewpointController.get_viewpoint
);

router.post(
  "/projects/:projectId/topics/:topicId/viewpoints/",
  ViewpointController.post_viewpoint
);

module.exports = router;
