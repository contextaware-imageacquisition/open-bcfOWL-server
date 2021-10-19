const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const fuseki = require("../Utilities/FusekiUtilities");
const auth = require("basic-auth");

exports.sparql_query_endpoint = (req, res, next) => {
  projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  if (req.headers.accept) {
    myHeaders.append("Accept", req.headers["accept"]);
  }

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
      console.log(result);
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
    PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
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

exports.get_graph = (req, res, next) => {
  var projectId = req.params.projectId;
  var ressource = req.params.ressource;

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
    CONSTRUCT { ?s ?p ?o}
    WHERE {?s ?p ?o . }
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

exports.get_user = (req, res, next) => {
  console.log("Test User");
  var userId = req.params.ressource;

  console.log(userId);

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  //TODO: If header "accept" is true, take that header, otherwise leave header (returns ttl)

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX user: <http://my-bcf-url/users#>
    CONSTRUCT { ?s ?p ?o}
    WHERE {user:${userId} ?p ?o;
    ?p ?o .      
    bind(user:${userId} as ?s)
    }
    `
  );

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  console.log(urlencoded);

  fetch(process.env.FUSEKI_URL + "users", requestOptions)
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
    PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
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
