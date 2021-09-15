const fetch = require("node-fetch");
const sparqlConverter = require("./Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("./Utilities/FusekiUtilities");

exports.get_projects = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  datasetPaths = [];

  fetch(process.env.FUSEKI_URL + "$/datasets", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var datasets = result.datasets;
      for (dataset in datasets) {
        var singleDataset = datasets[dataset];
        // console.log(singleDataset);
        var name = singleDataset["ds.name"];
        datasetPaths.push(name);
      }

      var myHeaders = new fetch.Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Authorization", "Basic " + fuseki.auth());

      var services = "";

      for (dataset in datasetPaths) {
        if (dataset == 0) {
          var query = `
          {
            SERVICE <${
              process.env.FUSEKI_URL + datasetPaths[dataset].slice(1)
            }> {
              ?s a bcfOWL:Project;
                ?p ?o
            }
          }`;

          services += query;
        } else {
          var query = `
          UNION {
            SERVICE <${
              process.env.FUSEKI_URL + datasetPaths[dataset].slice(1)
            }> {
              ?s a bcfOWL:Project;
                ?p ?o
            }
          }`;
          services += query;
        }
      }

      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "query",
        `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    
        SELECT ?s ?p ?o
        WHERE {
          ${services}
        }`
      );

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      };

      fetch(process.env.FUSEKI_URL + datasetPaths[0].slice(1), requestOptions)
        .then((response) => response.json())
        .then((result) => {
          var bcfMap = {};
          var bcfReturn = [];
          for (value in result.results.bindings) {
            var binding = result.results.bindings[value];

            if (bcfMap[binding.s.value]) {
              tempObject = bcfMap[binding.s.value];
              // console.log(binding.p.value);
              Object.assign(tempObject, sparqlConverter.toProjectJson(binding));
            } else {
              bcfMap[binding.s.value] = sparqlConverter.toProjectJson(binding);
            }
          }
          for (object in bcfMap) {
            //console.log(bcfMap.object);
            bcfReturn.push(bcfMap[object]);
          }
          res.status(200).json(bcfReturn);
        })
        .catch((error) => {
          console.log("error", error);
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_project = (req, res, next) => {
  const projectId = uuid.v4();

  var author = "JohnDoe";

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };

  // creating a new dataset with the GUID
  fetch(
    `http://semantic-collab.eu:8080/fuseki/$/datasets?dbType=tdb2&dbName=${projectId}`,
    requestOptions
  )
    .then((response) => response)
    .then((result) => {
      if (result.status == 200) {
        console.log(result.status);
        var urlencoded = new URLSearchParams();
        urlencoded.append(
          "update",
          `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
        PREFIX project: <${process.env.BCF_URL + projectId}#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
        INSERT DATA {
          project:${projectId} a bcfOWL:Project;
            bcfOWL:hasGuid "${projectId}"^^xsd:string ;
            bcfOWL:hasName "${req.body.name}"^^xsd:string ;
            bcfOWL:hasUser project:${author} .

          project:${author} a foaf:Person ;
            foaf:name "${author}"^^xsd:string
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
          .then((response) => response)
          .then((result) => {
            console.log(result);
            if (result.status == 200) {
              res.status(201).json({
                project_id: `${projectId}`,
                name: `${req.body.name}`,
              });
            } else {
              res.status(400).json("Error");
              //TODO: if request fails, delete the Database
            }
          })
          .catch((error) => {
            console.log("error", error);
          });
      } else {
        res.status(400).json("Error");
      }
    })
    .catch((error) => res.status(400));
};
