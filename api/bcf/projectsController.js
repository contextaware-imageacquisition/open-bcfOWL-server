const fetch = require("node-fetch");
const sparqlConverter = require("../Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("../Utilities/FusekiUtilities");
const jwt = require("jsonwebtoken");

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

  var author = "";
  var authorMail = jwt.decode(req.headers.authorization.split(" ")[1]).id;

  // console.log(author);

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
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "query",
        `
        PREFIX users: <${process.env.BCF_URL}users#> 
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
        SELECT ?user
    
        WHERE {{
          ?user foaf:mbox <mailto:${authorMail}>
          }
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
          var users = result.results.bindings;
          for (userUri in users) {
            if (users[userUri].user) {
              author = users[userUri].user.value;
            }
          }

          var services = "";
          var serviceURL = `${process.env.FUSEKI_URL.split("://")[0]}://${
            process.env.FUSEKI_NAME
          }:${process.env.FUSEKI_PW}@${process.env.FUSEKI_URL.split("://")[1]}`;

          for (dataset in datasetPaths) {
            if (dataset == 0) {
              var query = `
              {
                SERVICE <${serviceURL + datasetPaths[dataset].slice(1)}> {
                  ?s a bcfOWL:Project;
                    bcfOWL:hasUser <${author}> ;
                    ?p ?o .
                }
              }`;

              services += query;
            } else {
              var query = `
              UNION {
                SERVICE <${serviceURL + datasetPaths[dataset].slice(1)}> {
                  ?s a bcfOWL:Project;
                    bcfOWL:hasUser <${author}> ;
                    ?p ?o .
                }
              }`;
              services += query;
            }
          }

          var urlencoded = new URLSearchParams();
          urlencoded.append(
            "query",
            `
            PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
            PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
        
            SELECT ?s ?p ?o
            WHERE {
              ${services}
            }`
          );

          var newHeaders = new fetch.Headers();
          newHeaders.append(
            "Content-Type",
            "application/x-www-form-urlencoded"
          );
          newHeaders.append("Authorization", "Basic " + fuseki.auth());

          var requestOptions = {
            method: "POST",
            headers: newHeaders,
            body: urlencoded,
            redirect: "follow",
          };
          // console.log(process.env.FUSEKI_URL + datasetPaths[0].slice(1));
          fetch(process.env.FUSEKI_URL + "users", requestOptions)
            .then((response) => response.json())
            .then((result) => {
              var bcfMap = {};
              var bcfReturn = [];
              for (value in result.results.bindings) {
                var binding = result.results.bindings[value];

                if (bcfMap[binding.s.value]) {
                  tempObject = bcfMap[binding.s.value];
                  // console.log(binding.p.value);
                  Object.assign(
                    tempObject,
                    sparqlConverter.toProjectJson(binding)
                  );
                } else {
                  bcfMap[binding.s.value] =
                    sparqlConverter.toProjectJson(binding);
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
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_project = (req, res, next) => {
  const projectId = uuid.v4();

  var author = "";
  var authorName = jwt.decode(req.headers.authorization.split(" ")[1]).name;
  var authorMail = jwt.decode(req.headers.authorization.split(" ")[1]).id;

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
    `${process.env.FUSEKI_URL}$/datasets?dbType=tdb2&dbName=${projectId}`,
    requestOptions
  )
    .then((response) => response)
    .then((result) => {
      if (result.status == 200) {
        var urlencoded = new URLSearchParams();
        urlencoded.append(
          "query",
          `
          PREFIX users: <${process.env.BCF_URL}users#> 
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      
          SELECT ?user
      
          WHERE {{
            ?user foaf:mbox <mailto:${authorMail}>
            }
          }
          `
        );

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: urlencoded,
          redirect: "follow",
        };

        var timestamp = new Date(Date.now()).toISOString();

        fetch(process.env.FUSEKI_URL + "users", requestOptions)
          .then((response) => response.json())
          .then((result) => {
            var users = result.results.bindings;
            for (userUri in users) {
              if (users[userUri].user) {
                author = users[userUri].user.value;
              }
            }
            var urlencoded = new URLSearchParams();
            urlencoded.append(
              "update",
              `
              PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
              PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
              PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              
              INSERT DATA {
                project: a bcfOWL:Project;
                  bcfOWL:hasGuid "${projectId}"^^xsd:string ;
                  bcfOWL:hasName "${req.body.name}"^^xsd:string ;
                  rdfs:comment  "${req.body.description}"^^xsd:string;
                  bcfOWL:hasCreationDate "${timestamp}"^^xsd:datetime;
                  bcfOWL:hasPriority project:Priority_Low,  project:Priority_Medium, project:Priority_High;
                  bcfOWL:hasTopicStatus project:TopicStatus_Open, project:TopicStatus_Closed;
                  bcfOWL:hasTopicType project:TopicType_Issue, project:TopicType_InformationRequest;
                  bcfOWL:hasContext project:DocumentationContext;
                  bcfOWL:hasUser <${author}> .

                project:DocumentationContext a bcfOWL:Context;
                  rdfs:label  "Documentation Context"^^xsd:string;
                  rdfs:comment "The context for documenting buildings with BCF"^^xsd:string .

                project:Priority_Low a bcfOWL:Priority;
                  rdfs:label    "Low"^^xsd:string;
                  rdfs:comment  "A low priority"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

                project:Priority_Medium a bcfOWL:Priority;
                  rdfs:label    "Medium"^^xsd:string;
                  rdfs:comment  "A medium priority"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

                project:Priority_High a bcfOWL:Priority;
                  rdfs:label    "High"^^xsd:string;
                  rdfs:comment  "A high priority"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

                project:TopicStatus_Open a bcfOWL:TopicStatus;
                  rdfs:label    "Open"^^xsd:string;
                  rdfs:comment  "A open issue"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

                project:TopicStatus_Closed a bcfOWL:TopicStatus;
                  rdfs:label    "Closed"^^xsd:string;
                  rdfs:comment  "A closed issue"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

                project:TopicType_Issue a bcfOWL:TopicType;
                  rdfs:label    "Issue"^^xsd:string;
                  rdfs:comment  "Used for communicating problems in the building"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

                project:TopicType_InformationRequest a bcfOWL:TopicType;
                  rdfs:label    "Information Request"^^xsd:string;
                  rdfs:comment  "Using the BCF workflow for requesting specific, location- and/or element-based information"^^xsd:string;
                  bcfOWL:hasContext project:DocumentationContext .

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
          });
      } else {
        res.status(400).json("Error");
      }
    })
    .catch((error) => res.status(400));
};
