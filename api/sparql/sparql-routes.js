const express = require("express");
const router = express.Router();

//const { post } = require('../Models/extensions');
const TopicsController = require("./sparql-topics");
const SparqlEndpoint = require("./sparql-endpoint");
const CommentController = require("./sparql-comments");
const ViewpointController = require("./sparql-viewpoints");

// Query main server with sparql
router.post("/", SparqlEndpoint.sparql_query_endpoint);

// Query specific project server with sparql
router.post("/:projectId/");

// Topics
router.get("/:projectId/topics", TopicsController.get_all_topics);

router.get("/:projectId/topics/:topicId", TopicsController.get_topic);

router.post("/:projectId/topics", TopicsController.post_topic);

router.put("/:projectId/topics/:topicId", TopicsController.put_topic);

// Comments
router.get("/:projectId/comments", CommentController.get_all_comments);

router.get(
  "/:projectId/topics/:topicId/comments",
  CommentController.get_all_topic_comments
);

router.get(
  "/:projectId/topics/:topicId/comments/:commentId",
  CommentController.get_comment
);

router.post(
  "/:projectId/topics/:topicId/comments/",
  CommentController.post_comment
);

router.put(
  "/:projectId/topics/:topicId/comments/:commentId",
  CommentController.put_comment
);

// Viewpoints
router.get("/:projectId/viewpoints", ViewpointController.get_all_viewpoints);

router.get(
  "/:projectId/topics/:topicId/viewpoints",
  ViewpointController.get_all_topic_viewpoints
);

router.get(
  "/:projectId/topics/:topicId/viewpoints/:viewpointId",
  ViewpointController.get_viewpoint
);

router.post(
  "/:projectId/topics/:topicId/viewpoints/",
  ViewpointController.post_viewpoint
);

module.exports = router;
