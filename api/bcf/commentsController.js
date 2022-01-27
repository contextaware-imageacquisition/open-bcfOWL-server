const fetch = require("node-fetch");
const sparqlConverter = require("../Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("../Utilities/FusekiUtilities");
const jwt = require("jsonwebtoken");

exports.get_all_comments = (req, res, next) => {
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
          PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
          \nSELECT ?s ?p ?o
          \nWHERE {?s a bcfOWL:Comment ;
            \n?p ?o .
            \n}`
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
                sparqlConverter.toCommentJson(binding, users)
              );
            } else {
              bcfMap[binding.s.value] = sparqlConverter.toCommentJson(
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
          res.status(400).json(error);
        });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

exports.get_all_topic_comments = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
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
              Object.assign(
                tempObject,
                sparqlConverter.toCommentJson(binding, users)
              );
            } else {
              bcfMap[binding.s.value] = sparqlConverter.toCommentJson(
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
          res.status(400).json(error);
        });
    })
    .catch((error) => {
      res.status(400).json(error);
    });

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
        PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
        SELECT ?s ?p ?o
        WHERE {
            ?s	bcfOWL:hasTopic project:${topicId} .
            ?s a bcfOWL:Comment ;
            ?p ?o .
            }
        `
  );
};

exports.get_comment = (req, res, created) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var commentId = req.params.commentId;

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  if (created.bCreated == true) {
    var bCreated = created.bCreated;
    commentId = created.commentId;
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
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
        PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
        
        SELECT ?s ?p ?o
        
        WHERE {
          ?s	bcfOWL:hasTopic project:${topicId} .
          ?s	bcfOWL:hasGuid "${commentId}" .
          ?s 	a 	bcfOWL:Comment ;
                  ?p	?o .
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
          console.log(result);
          var bcfMap = {};
          for (value in result.results.bindings) {
            var binding = result.results.bindings[value];
            Object.assign(
              bcfMap,
              sparqlConverter.toCommentJson(binding, users)
            );
          }
          if (bCreated == true) {
            res.status(201).json(bcfMap);
          } else {
            res.status(200).json(bcfMap);
          }
        })
        .catch((error) => {
          res.status(400).json(error);
        });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

exports.post_comment = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  if (req.body.guid) {
    var commentId = req.body.guid;
  } else {
    var commentId = uuid.v4();
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
      var users = result.results.bindings;
      for (userUri in users) {
        if (users[userUri].author) {
          author = users[userUri].author.value;
        }
      }
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "update",
        `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
        PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        INSERT {
          project:${commentId} a bcfOWL:Comment ;
            bcfOWL:hasGuid "${commentId}"^^xsd:string ;
            bcfOWL:hasTopic project:${topicId} ;
            bcfOWL:hasProject project:${projectId} ;
            bcfOWL:hasAuthor <${author}> ;
            bcfOWL:hasCommentDate "${timestamp}"^^xsd:dateTime ;\n` +
          sparqlConverter.toCommentSPARQL(req) +
          `} WHERE {
            ?s ?p ?o
            FILTER NOT EXISTS { project:${commentId} ?p ?o} 
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
            this.get_comment(req, res, {
              bCreated: true,
              commentId: commentId,
            });
          } else {
            res.status(400).json("error");
          }
        })
        .catch((error) => {
          res.status(400).json(error);
        });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

exports.put_comment = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  const commentId = req.params.commentId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

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
      var users = result.results.bindings;
      for (userUri in users) {
        if (users[userUri].author) {
          author = users[userUri].author.value;
        }
      }
      //TODO: Add Event System
      var urlencoded = new URLSearchParams();
      urlencoded.append(
        "update",
        `
        PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
        PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        DELETE {
          ?s bcfOWL:hasComment ?o.
          ?s bcfOWL:hasModifiedAuthor ?o.
          ?s bcfOWL:hasModifiedDate ?o.
        }
        INSERT {
          ?s bcfOWL:hasComment "${req.body.comment}" .
          ?s bcfOWL:hasModifiedAuthor <${author}> .
          ?s bcfOWL:hasModifiedDate "${timestamp}"^^xsd:dateTime .
        }
        Where {
          ?s ?p ?o;
          bcfOWL:hasGuid "${commentId}"^^xsd:string;
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
            this.get_comment(req, res);
            // res.status(200).json(result);
          } else {
            res.status(400).json("error");
          }
        })
        .catch((error) => {
          res.status(400).json(error);
        });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};
