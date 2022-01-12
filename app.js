const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

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
).then(() => console.log("\nConnection with MongoDB established\n"))
.catch((err) => {
  console.log('error', err);
  throw err
})

const ApiRouter = require("./api/apiRoutes");
const SparqlRouter = require("./api/sparqlRoutes");
const GraphRouter = require("./api/graphRoutes");
const FileRouter = require("./api/fileRoutes");
const UserRouter = require("./api/userRoutes");

app.use(morgan("dev"));
//app.use("/uploads", express.static("uploads"))
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "100mb" }));
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
