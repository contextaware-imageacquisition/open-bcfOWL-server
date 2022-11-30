const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const frameguard = require("frameguard");

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./api/bcfAPI.json");

const app = express();

// BCF implementation

mongoose.connect(
  process.env.MONGO_ATLAS_URL +
    process.env.MONGO_ATLAS_MAIN_SERVER +
    "?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const ApiRouter = require("./api/apiRoutes");
const SparqlRouter = require("./api/sparqlRoutes");
const GraphRouter = require("./api/graphRoutes");
const FileRouter = require("./api/fileRoutes");
const UserRouter = require("./api/userRoutes");

app.use(morgan("dev"));
//app.use("/uploads", express.static("uploads"))
app.use(express.urlencoded({ limit: "5mb", extended: false }));
app.use(express.json({ limit: "200mb" }));
//app.use(express.urlencoded({ limit: "5mb" }));
app.use(express.json());
app.use(frameguard({ action: "sameorigin" }));
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
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/bcf", ApiRouter);
app.use("/sparql", SparqlRouter);
app.use("/graph", GraphRouter);
app.use("/users", UserRouter);
app.use("/files", FileRouter);

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
