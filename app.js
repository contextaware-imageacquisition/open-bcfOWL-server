const express = require("express");
const morgan = require("morgan");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
const app = express();

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./bcfAPI.json");

// BCF implementation

const sparqlRoutes = require("./api/sparql/sparql-routes");

app.use(morgan("dev"));
//app.use("/uploads", express.static("uploads"))
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/bcf/sparql", sparqlRoutes);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handlers

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;