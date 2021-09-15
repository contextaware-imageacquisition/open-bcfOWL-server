const fetch = require("node-fetch");
const sparqlConverter = require("./Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("./Utilities/FusekiUtilities");

exports.get_all_comments = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
      PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
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
      console.log(result);
      var bcfMap = {};
      var bcfReturn = [];
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];

        if (bcfMap[binding.s.value]) {
          tempObject = bcfMap[binding.s.value];
          // console.log(binding.p.value);
          Object.assign(tempObject, sparqlConverter.toCommentJson(binding));
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toCommentJson(binding);
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
};

exports.get_all_topic_comments = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
        \nPREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
        \nPREFIX project: <${process.env.BCF_URL + projectId}#>
        \nSELECT ?s ?p ?o
        \nWHERE {
            \n?s	bcfOWL:hasTopic project:${topicId} .
            \n?s a bcfOWL:Comment ;
            \n?p ?o .
            \n}
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
      var bcfReturn = [];
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];

        if (bcfMap[binding.s.value]) {
          tempObject = bcfMap[binding.s.value];
          Object.assign(tempObject, sparqlConverter.toCommentJson(binding));
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toCommentJson(binding);
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
};

exports.get_comment = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  const commentId = req.params.commentId;

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    \nPREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    \nPREFIX project: <${process.env.BCF_URL + projectId}#>
    
    \nSELECT ?s ?p ?o
    
    \nWHERE {
      \n?s	bcfOWL:hasTopic project:${topicId} .
      \n?s	bcfOWL:hasGuid	"${commentId}" .
      \n?s 	a 	bcfOWL:Comment ;
        \n      ?p	?o .
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
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];
        Object.assign(bcfMap, sparqlConverter.toCommentJson(binding));
      }
      res.status(200).json(bcfMap);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_comment = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  if (req.body.guid) {
    commentId = req.body.guid;
  } else {
    commentId = uuid.v4();
  }

  var author = "JohnDoe";

  var timestamp = new Date(Date.now()).toISOString();

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX project: <${process.env.BCF_URL + projectId}#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    INSERT {
      project:${commentId} a bcfOWL:Comment ;
        bcfOWL:hasGuid "${commentId}"^^xsd:string ;
        bcfOWL:hasTopic project:${topicId} ;
        bcfOWL:hasProject project:${projectId} ;
        bcfOWL:hasCreationAuthor project:${author} ;
        bcfOWL:hasCommentDate "${timestamp}"^^xsd:dateTime ;\n` +
      sparqlConverter.toCommentSPARQL(req) +
      `} WHERE {
        ?s ?p ?o
        FILTER NOT EXISTS { project:${commentId} ?p ?o} 
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
      //TODO: create response from request body and generated values and return them
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.put_comment = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  const commentId = req.params.commentId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var author = "JaneDoe";

  var timestamp = new Date(Date.now()).toISOString();
  //TODO: Add Event System
  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX project: <${process.env.BCF_URL + projectId}#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    DELETE {
      ?s bcfOWL:hasComment ?o.
      ?s bcfOWL:hasModifiedAuthor ?o.
      ?s bcfOWL:hasModifiedDate ?o.
    }
    INSERT {
      ?s bcfOWL:hasComment "${req.body.comment}" .
      ?s bcfOWL:hasModifiedAuthor project:${author} .
      ?s bcfOWL:hasModifiedDate "${timestamp}"^^xsd:dateTime .
    }
    Where {
      ?s ?p ?o;
       bcfOWL:hasGuid "${commentId}"^^xsd:string;
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
      //TODO: create response from request body and generated values and return them
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log("error", error);
    });
};
