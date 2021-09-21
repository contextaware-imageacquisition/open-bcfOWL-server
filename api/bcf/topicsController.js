const fetch = require("node-fetch");
const sparqlConverter = require("../Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("../Utilities/FusekiUtilities");
const jwt = require("jsonwebtoken");
const user = require("../auth/Models/user");

exports.get_all_topics = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

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
        WHERE {?s a bcfOWL:Topic ;
          ?p ?o .
          }`
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
          var bcfReturn = [];
          for (value in result.results.bindings) {
            var binding = result.results.bindings[value];

            if (bcfMap[binding.s.value]) {
              tempObject = bcfMap[binding.s.value];
              // console.log(binding.p.value);
              Object.assign(
                tempObject,
                sparqlConverter.toTopicJson(binding, users)
              );
            } else {
              bcfMap[binding.s.value] = sparqlConverter.toTopicJson(
                binding,
                users
              );
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

exports.get_topic = (req, res, created) => {
  const projectId = req.params.projectId;
  var topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());
  var bCreated = false;

  if (created.bCreated == true) {
    var bCreated = created.bCreated;
    topicId = created.topicId;
  }

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
          ?s bcfOWL:hasGuid "${topicId}" .
          ?s a bcfOWL:Topic ;
            ?p ?o .
        }`
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
          for (value in result.results.bindings) {
            var binding = result.results.bindings[value];
            Object.assign(bcfMap, sparqlConverter.toTopicJson(binding, users));
          }
          if (bCreated == true) {
            console.log("test");
            res.status(201).json(bcfMap);
          } else {
            console.log("test2");
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

exports.post_topic = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var topicId;

  if (req.body.guid) {
    topicId = req.body.guid;
  } else {
    topicId = uuid.v4();
  }
  var authorName = jwt.decode(req.headers.authorization.split(" ")[1]).name;
  var authorMail = jwt.decode(req.headers.authorization.split(" ")[1]).id;
  authorName = authorName.replace(" ", "_");

  var timestamp = new Date(Date.now()).toISOString();

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX users: <${process.env.BCF_URL}users#> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?author ?assignedauthor

    WHERE {{
      ?author foaf:mbox <mailto:${authorMail}>
      } UNION {
      ?assignedauthor foaf:mbox <mailto:${req.body.assigned_to}>
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
      var author = "";
      var assignedTo = "";
      var users = result.results.bindings;
      for (userUri in users) {
        if (users[userUri].author) {
          author = users[userUri].author.value;
        } else if (users[userUri].assignedauthor) {
          assignedTo = users[userUri].assignedauthor.value;
        }
      }
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "update",
        `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
        PREFIX project: <${process.env.BCF_URL + projectId}#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX users: <${process.env.BCF_URL}users#>

        INSERT {
          project:${topicId} a bcfOWL:Topic ;
            bcfOWL:hasGuid "${topicId}"^^xsd:string ;
            bcfOWL:hasProject project:${projectId} ;
            bcfOWL:hasCreationAuthor <${author}> ;
            bcfOWL:hasCreationDate "${timestamp}"^^xsd:dateTime ;\n` +
          sparqlConverter.toTopicSPARQL(req, assignedTo) +
          `} WHERE {
            ?s ?p ?o
            FILTER NOT EXISTS { project:${topicId} ?p ?o}
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
          this.get_topic(req, res, { bCreated: true, topicId: topicId });
        })
        .catch((error) => {
          console.log("error", error);
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.put_topic = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var author = jwt
    .decode(req.headers.authorization.split(" ")[1])
    .name.replace(" ", "_");

  var timestamp = new Date(Date.now()).toISOString();

  var authorName = jwt.decode(req.headers.authorization.split(" ")[1]).name;
  var authorMail = jwt.decode(req.headers.authorization.split(" ")[1]).id;
  authorName = authorName.replace(" ", "_");

  var timestamp = new Date(Date.now()).toISOString();

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX users: <${process.env.BCF_URL}users#> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?author ?assignedauthor

    WHERE {{
      ?author foaf:mbox <mailto:${authorMail}>
      } UNION {
      ?assignedauthor foaf:mbox <mailto:${req.body.assigned_to}>
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
      var author = "";
      var assignedTo = "";
      var users = result.results.bindings;
      for (userUri in users) {
        if (users[userUri].author) {
          author = users[userUri].author.value;
        } else if (users[userUri].assignedauthor) {
          assignedTo = users[userUri].assignedauthor.value;
        }
      }
      //TODO: Add Event System
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "update",
        `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
        PREFIX project: <${process.env.BCF_URL + projectId}#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        DELETE {
          ?s  bcfOWL:hasModifiedAuthor ?o .
          ?s  bcfOWL:hasModifiedDate ?o .
          ${sparqlConverter.toTopicSPARQLUpdate(req)}
        }
        INSERT {
          ?s  bcfOWL:hasModifiedAuthor <${author}>;
              bcfOWL:hasModifiedDate "${timestamp}"^^xsd:datetime;
              ${sparqlConverter.toTopicSPARQL(req, assignedTo)} 
        }
        Where {
          ?s ?p ?o;
            bcfOWL:hasGuid "${topicId}"^^xsd:string;
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
        .then((result) => {
          if (result.status == 200) {
            this.get_topic(req, res);
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
