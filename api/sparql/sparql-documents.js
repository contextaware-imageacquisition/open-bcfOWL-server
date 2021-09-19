const fetch = require("node-fetch");
const FormData = require("form-data");
const sparqlConverter = require("./Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("./Utilities/FusekiUtilities");

exports.get_documents = (req, res, next) => {
  const projectId = req.params.projectId;
  const documentId = req.params.documentId;
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
      ?s a bcfOWL:Document;
         ?p ?o;
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
      var bcfReturn = [];
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];

        if (bcfMap[binding.s.value]) {
          tempObject = bcfMap[binding.s.value];
          Object.assign(tempObject, sparqlConverter.toDocumentJson(binding));
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toDocumentJson(binding);
        }
      }
      for (object in bcfMap) {
        bcfReturn.push(bcfMap[object]);
      }
      res.status(200).json(bcfReturn);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.get_document = (req, res, next) => {
  const projectId = req.params.projectId;
  const documentId = req.params.documentId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>

    SELECT ?o
    WHERE {
      ?s a bcfOWL:Document;
         bcfOWL:hasGuid "${documentId}";
         bcfOWL:hasDocumentURL ?o
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
      // since this request should always just return one document, we can choose the first result
      var documentUrl = result.results.bindings[0].o.value;
      // split the Url so we just get the name
      var documentSplit = documentUrl.split("/");
      var documentName = documentSplit[documentSplit.length - 1];

      console.log(documentName);

      var fileHeader = new fetch.Headers();
      fileHeader.append("Authorization", "Basic " + fuseki.fileauth());

      var requestOptions = {
        method: "GET",
        headers: fileHeader,
        redirect: "follow",
      };

      console.log(process.env.FILESERVER_URL + `${projectId}/${documentName}`);

      fetch(
        process.env.FILESERVER_URL + `${projectId}/${documentName}`,
        requestOptions
      )
        .then((response) => response.arrayBuffer())
        .then((result) => {
          console.log(result);
          var data = result;
          var buff = new Buffer.from(data, "");
          console.log();
          res.status(200).send(buff);
        })
        .catch((error) => console.log("error", error));
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_document = (req, res, next) => {
  const projectId = req.params.projectId;

  const documentId = uuid.v4();

  var data = new Buffer.from("");

  req.on("data", function (chunk) {
    data = Buffer.concat([data, chunk]);
  });
  req.on("end", function () {
    const filename = req
      .header("Content-Disposition")
      .split("=")[1]
      .split('"')[1];

    const fileType = filename.split(".")[1];

    console.log(filename);
    console.log(fileType);

    var formdata = new FormData();
    formdata.append("fileStream", data, `${documentId}.${fileType}`);

    var fileHeader = new fetch.Headers();
    fileHeader.append("Authorization", "Basic " + fuseki.fileauth());

    const fileUrl =
      process.env.FILESERVER_URL + `${projectId}/${documentId}.${fileType}`;

    var requestOptions = {
      method: "POST",
      headers: fileHeader,
      body: formdata,
      redirect: "follow",
    };
    fetch(fileUrl, requestOptions)
      .then((response) => response)
      .then((result) => {
        //TODO: Write Utility for checking codes!
        if (result.status == 201) {
          console.log(fileUrl);
          var myHeaders = new fetch.Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
          myHeaders.append("Authorization", "Basic " + fuseki.auth());

          var urlencoded = new URLSearchParams();
          urlencoded.append(
            "update",
            `
          PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
          PREFIX project: <${process.env.BCF_URL + projectId}#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          PREFIX geo: <http://www.opengis.net/ont/geosparql#>
          
          INSERT {
            project:${documentId} a bcfOWL:Document ;
              bcfOWL:hasGuid "${documentId}"^^xsd:string ;
              bcfOWL:hasFilename "${filename}" ;
              bcfOWL:hasDocumentURL "${fileUrl}"^^xsd:anyURI ;
              bcfOWL:hasProject project:${projectId} ;\n` +
              `} WHERE {
              ?s ?p ?o
              FILTER NOT EXISTS { project:${documentId} ?p ?o} 
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
              res.status(201).json({
                guid: documentId,
                filename: filename,
              });
            })
            .catch((error) => {
              console.log("error", error);
            });
        }
      })
      .catch((error) => console.log("error", error));
  });
};

// Spatial Representation is part of the BCF Extension!
exports.get_spatial = (req, res, next) => {
  const projectId = req.params.projectId;
  const documentId = req.params.documentId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX project: <${process.env.BCF_URL + projectId}#>

    SELECT ?s ?p ?o
    WHERE {
      project:spatial_${documentId} a bcfOWL:SpatialRepresentation;
        ?p ?o;
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
      var bcfMap = {
        documentId: documentId,
      };
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];
        Object.assign(bcfMap, sparqlConverter.toSpatialJson(binding));
      }
      res.status(200).json(bcfMap);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_spatial = (req, res, next) => {
  const projectId = req.params.projectId;

  const documentId = req.params.documentId;

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  const spatialId = `spatial_${documentId}`;

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX project: <${process.env.BCF_URL + projectId}#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    DELETE {
      project:spatial_${documentId} ?p ?o
    }
    INSERT {
      project:${documentId} a bcfOWL:Document ;
        bcfOWL:hasSpatialRepresentation project:${spatialId} .

      project:${spatialId} a bcfOWL:SpatialRepresentation ;
        bcfOWL:hasLocation  "POINT Z(${req.body.location.x} ${
      req.body.location.y
    } ${req.body.location.z})"^^geo:wktLiteral ;
        bcfOWL:hasRotation  "POINT Z(${req.body.rotation.x} ${
      req.body.rotation.y
    } ${req.body.rotation.z})"^^geo:wktLiteral ;
        bcfOWL:hasScale     "POINT Z(${req.body.scale.x} ${req.body.scale.y} ${
      req.body.scale.z
    })"^^geo:wktLiteral ;
        bcfOWL:hasAlignment "center"^^xsd:string ;
        bcfOWL:hasDocument  project:${documentId};

    } WHERE {
      ?s ?p ?o
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
        res.status(200).json({
          documentId: documentId,
          alignment: "center",
          location: req.body.location,
          rotation: req.body.rotation,
          scale: req.body.scale,
        });
      } else {
        res.status(401).json("error");
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
};
