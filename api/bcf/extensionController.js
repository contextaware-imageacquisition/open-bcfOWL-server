const fetch = require("node-fetch");
const sparqlConverter = require("../Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("../Utilities/FusekiUtilities");
const jwt = require("jsonwebtoken");

exports.get_extensions = (req, res, bCreated) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var version = req.params.version;

  var users = {};

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?s ?p

    WHERE {
      ?s foaf:mbox ?p
    }
    `
  );

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + "users", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var userResponse = result.results.bindings;
      for (userEntry in userResponse) {
        users[userResponse[userEntry].s.value] = userResponse[
          userEntry
        ].p.value.replace("mailto:", "");
      }
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "query",
        `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/> 

        SELECT ?s ?p ?o
        WHERE {
          ?s a bcfOWL:Project;
            ?p ?o
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
        .then((response) => response.json())
        .then((result) => {
          var bcfMap = {};
          bcfMap = sparqlConverter.toExtensionJson(result, users, version);

          if (bCreated == true) {
            res.status(201).json(bcfMap);
          } else {
            res.status(200).json(bcfMap);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_extensions = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  console.log(req.params.version);
  if (req.params.version == "2.1") {
    var userId = req.body.user_id_type;
  } else {
    userId = req.body.users;
  }

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?s
    WHERE {
      ${sparqlConverter.toUserSPARQL(userId)}
    }
    `
  );

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + "users", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var userUris = [];
      var response = result.results.bindings;
      for (binding in response) {
        userUris.push(response[binding].s.value);
      }
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "update",
        `
          PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
          PREFIX project: <${process.env.BCF_URL + projectId}#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          PREFIX users: <${process.env.BCF_URL}users#>
          INSERT DATA{
            project: a bcfOWL:Project ;
              ${sparqlConverter.toExtensionSPARQL(req.body, userUris)}
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
      fetch(process.env.FUSEKI_URL + projectId, requestOptions)
        .then((result) => {
          console.log(result);
          if (result.status == 200) {
            var test = true;
            this.get_extensions(req, res, test);
          } else {
            res.status(400).json("Error");
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
};
