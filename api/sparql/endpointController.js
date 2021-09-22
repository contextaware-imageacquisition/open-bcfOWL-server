const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const fuseki = require("../Utilities/FusekiUtilities");
const auth = require("basic-auth");

exports.sparql_query_endpoint = (req, res, next) => {
  projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append("query", req.body.query);
  // res.status(200).json("okay");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + projectId, requestOptions, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.get_ressource = (req, res, next) => {
  var projectId = req.params.projectId;
  var ressource = req.params.ressource;

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX project: <${process.env.BCF_URL + projectId}/>
    CONSTRUCT { ?s ?p ?o}
    WHERE {project:${ressource} ?p ?o;
    ?p ?o .      
    bind(project:${ressource} as ?s)
    }
    `
  );

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      res.header("Content-Type", "text/plain");
      res.end(result);
    })
    .catch((error) => console.log("error", error));
};

exports.get_project = (req, res, next) => {
  var projectId = req.params.projectId;
  var ressource = req.params.ressource;

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX project: <${process.env.BCF_URL + projectId}/>
    CONSTRUCT { ?s ?p ?o}
    WHERE {?s ?p ?o}
    `
  );

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      res.header("Content-Type", "text/plain");
      res.end(result);
    })
    .catch((error) => console.log("error", error));
};
