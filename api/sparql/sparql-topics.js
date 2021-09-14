const fetch = require("node-fetch");
const sparqlConverter = require("./Utilities/SparqlJsonConverter");
const uuid = require("uuid");

exports.get_all_topics = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    \nSELECT ?s ?p ?o
    \nWHERE {?s a bcfOWL:Topic ;
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
          Object.assign(tempObject, sparqlConverter.toTopicJson(binding));
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toTopicJson(binding);
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

exports.get_topic = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>

    \nSELECT ?s ?p ?o
    \nWHERE {
      \n  ?s bcfOWL:hasGuid "${topicId}" .
      \n  ?s a bcfOWL:Topic ;
      \n   ?p ?o .
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
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];
        Object.assign(bcfMap, sparqlConverter.toTopicJson(binding));
      }
      res.status(200).json(bcfMap);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_topic = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var topicId;

  if (req.body.guid) {
    topicId = req.body.guid;
  } else {
    topicId = uuid.v4();
  }

  var author = "JohnDoe";

  var timestamp = new Date(Date.now()).toISOString();

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX inst: <http://example.org#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    INSERT {
      inst:${topicId}	a	bcfOWL:Topic ;
        bcfOWL:hasGuid "${topicId}"^^xsd:string ;
        bcfOWL:hasProject inst:${projectId} ;
        bcfOWL:hasCreationAuthor inst:${author} ;
        bcfOWL:hasCreationDay "${timestamp}"^^xsd:dateTime ;\n` +
      sparqlConverter.toTopicSPARQL(req) +
      `} WHERE {
        ?s ?p ?o
        FILTER NOT EXISTS { inst:${topicId} ?p ?o} 
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

exports.put_topic = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var author = "JaneDoe";

  var timestamp = new Date(Date.now()).toISOString();
  //TODO: Add Event System
  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX inst: <http://example.org#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    DELETE {
      ?s  bcfOWL:hasModifiedAuthor ?o .
      ?s  bcfOWL:hasModifiedDate ?o .
      ${sparqlConverter.toTopicSPARQLUpdate(req)}
    }
    INSERT {
      ?s  bcfOWL:hasModifiedAuthor inst:${author};
          bcfOWL:hasModifiedDate "${timestamp}"^^xsd:datetime;
          ${sparqlConverter.toTopicSPARQL(req)} 
    }
    Where {
      ?s ?p ?o;
       bcfOWL:hasGuid "${topicId}"^^xsd:string;
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
