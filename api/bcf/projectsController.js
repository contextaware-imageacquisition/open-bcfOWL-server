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
          }:${process.env.FUSEKI_PW}@${
            process.env.FUSEKI_URL.split("://")[1]
          }/`;

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
            PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
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
              PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
              PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
              PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
              
              INSERT DATA {
                project: a bcfOWL:Project;
                  bcfOWL:hasGuid "${projectId}"^^xsd:string ;
                  bcfOWL:hasName "${req.body.name}"^^xsd:string ;
                  bcfOWL:hasUser <${author}> .

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
