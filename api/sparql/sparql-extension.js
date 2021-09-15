const fetch = require("node-fetch");
const sparqlConverter = require("./Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("./Utilities/FusekiUtilities");

exports.get_extensions = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/> 

    SELECT ?s ?p ?o
    WHERE {
      ?s a bcfOWL:Extension;
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
      bcfMap = sparqlConverter.toExtensionJson(result);

      res.status(200).json(bcfMap);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_extensions = (req, res, next) => {
  const projectId = req.params.projectId;
  const extensionId = uuid.v4();
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var author = "JohnDoe";

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX project: <${process.env.BCF_URL + projectId}#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    INSERT DATA{
      project:${extensionId} a bcfOWL:Extension ;
        ${sparqlConverter.toExtensionSPARQL(req.body)}
    }
      `
  );

  console.log(urlencoded);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        console.log(result);
        res.status(201).json(result);
      } else {
        res.status(400).json("Error");
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
};
