const fetch = require("node-fetch");
const FormData = require("form-data");
const sparqlConverter = require("../Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("../Utilities/FusekiUtilities");
const jwt = require("jsonwebtoken");

exports.get_all_viewpoints = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#> 
    PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    SELECT DISTINCT ?s ?p ?o WHERE {
        {
        SELECT *
        WHERE {
            ?s a bcfOWL:Viewpoint ;
            ?p	?o .
        }
          } UNION {
        SELECT *
          WHERE {
            ?x bcfOWL:hasPerspectiveCamera ?s .
              ?s a bcfOWL:PerspectiveCamera ;
              ?p ?o .
                  }
        } UNION {
        SELECT *
          WHERE {
            ?x bcfOWL:hasSelection ?s .
              ?s a bcfOWL:Component;
              ?p ?o .
                }
        } UNION {
        SELECT *
          WHERE {
            ?x bcfOWL:hasException ?s .
              ?s a bcfOWL:Component;
              ?p ?o .
                }
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

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var bcfMap = {};
      var bcfReturn = [];
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];

        if (bcfMap[binding.s.value]) {
          tempObject = bcfMap[binding.s.value];
          // check if the value is a selection
          if (sparqlConverter.toViewpointJson(binding).selection) {
            // check if the viewpoint already has a selection
            if (tempObject.selection) {
              var tempSelect = tempObject.selection;
              // add the selection to the other ones
              tempSelect.push(
                sparqlConverter.toViewpointJson(binding).selection[0]
              );
              // replace them in the temp
              tempObject.selection = tempSelect;
              bcfMap[binding.s.value] = tempObject;
            } else {
              Object.assign(
                tempObject,
                sparqlConverter.toViewpointJson(binding)
              );
              bcfMap[binding.s.value] = tempObject;
            }
          } else if (sparqlConverter.toViewpointJson(binding).exception) {
            // check if the viewpoint already has a exception
            if (tempObject.exception) {
              var tempSelect = tempObject.exception;
              // add the exception to the other ones
              tempSelect.push(
                sparqlConverter.toViewpointJson(binding).exception[0]
              );
              // replace them in the temp
              tempObject.exception = tempSelect;
              bcfMap[binding.s.value] = tempObject;
            } else {
              Object.assign(
                tempObject,
                sparqlConverter.toViewpointJson(binding)
              );
              bcfMap[binding.s.value] = tempObject;
            }
          } else {
            Object.assign(tempObject, sparqlConverter.toViewpointJson(binding));
            bcfMap[binding.s.value] = tempObject;
          }
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toViewpointJson(binding);
        }
      }
      console.log(bcfMap);
      for (object in bcfMap) {
        var tempComponents = {};
        var tempVisibility = {};
        var tempSetupHints = {};
        var tempSelection = {};
        var tempException = {};
        var tempViewpoint = {};
        if (
          bcfMap[object].perspective_camera ||
          bcfMap[object].orthogonal_camera
        ) {
          var viewpointValues = bcfMap[object];

          if (bcfMap[object].perspective_camera) {
            perspectiveCamera = bcfMap[object].perspective_camera;
            tempViewpoint["perspective_camera"] = bcfMap[perspectiveCamera];
          } else if (bcfMap[object].orthogonal_camera) {
            orthogonalCamera = bcfMap[object].orthogonal_camera;
            tempViewpoint["orthogonal_camera"] = bcfMap[orthogonalCamera];
          }

          if (bcfMap[object].selection) {
            selectionArr = bcfMap[object].selection;
            tempSelectionArr = [];
            for (selection in selectionArr) {
              tempSelectionArr.push(bcfMap[selectionArr[selection]]);
            }
            tempSelection = tempSelectionArr;
          }

          if (bcfMap[object].exception) {
            exceptionArr = bcfMap[object].exception;
            tempExceptionArr = [];
            for (exception in exceptionArr) {
              tempExceptionArr.push(bcfMap[exceptionArr[exception]]);
            }
            tempException = tempExceptionArr;
          }

          tempViewpoint["guid"] = viewpointValues.guid;
          tempViewpoint["topic_guid"] = viewpointValues.topic_guid;
          tempViewpoint["originating_document"] =
            viewpointValues.originating_document;

          tempSetupHints["spaces_visible"] = viewpointValues.spaces_visible;
          tempSetupHints["space_boundaries_visible"] =
            viewpointValues.space_boundaries_visible;
          tempSetupHints["openings_visible"] = viewpointValues.openings_visible;

          tempVisibility["default_visibility"] =
            viewpointValues.default_visibility;
          tempVisibility["view_setup_hints"] = tempSetupHints;
          tempVisibility["exceptions"] = tempException;

          tempComponents["visibility"] = tempVisibility;
          tempComponents["selection"] = tempSelection;

          tempViewpoint["components"] = tempComponents;

          bcfReturn.push(tempViewpoint);
        }
      }
      // console.log(bcfMap);
      res.status(200).json(bcfReturn);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.get_all_topic_viewpoints = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#> 
    PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    SELECT DISTINCT ?s ?p ?o WHERE {
      {
        SELECT *
        WHERE {
            ?s	bcfOWL:hasTopic project:${topicId} .
            ?s 	a 	bcfOWL:Viewpoint ;
                ?p	?o .
          }
      } UNION {
          SELECT *
        WHERE {
            ?x	bcfOWL:hasTopic project:${topicId} .
              ?x	bcfOWL:hasPerspectiveCamera ?s .
              ?s	a	bcfOWL:PerspectiveCamera ;
                  ?p ?o .
        }
      } UNION {
          SELECT *
        WHERE {
            ?x	bcfOWL:hasTopic project:${topicId} .
              ?x	bcfOWL:hasSelection ?s .
              ?s	a bcfOWL:Component;
                ?p ?o .
        }
      } UNION {
          SELECT *
        WHERE {
            ?x	bcfOWL:hasTopic project:${topicId} .
              ?x	bcfOWL:hasException ?s .
            ?s	a bcfOWL:Component;
                ?p ?o .
        }
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

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var bcfMap = {};
      var bcfReturn = [];
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];

        if (bcfMap[binding.s.value]) {
          tempObject = bcfMap[binding.s.value];
          // check if the value is a selection
          if (sparqlConverter.toViewpointJson(binding).selection) {
            // check if the viewpoint already has a selection
            if (tempObject.selection) {
              var tempSelect = tempObject.selection;
              // add the selection to the other ones
              tempSelect.push(
                sparqlConverter.toViewpointJson(binding).selection[0]
              );
              // replace them in the temp
              tempObject.selection = tempSelect;
              bcfMap[binding.s.value] = tempObject;
            } else {
              Object.assign(
                tempObject,
                sparqlConverter.toViewpointJson(binding)
              );
              bcfMap[binding.s.value] = tempObject;
            }
          } else if (sparqlConverter.toViewpointJson(binding).exception) {
            // check if the viewpoint already has a exception
            if (tempObject.exception) {
              var tempSelect = tempObject.exception;
              // add the exception to the other ones
              tempSelect.push(
                sparqlConverter.toViewpointJson(binding).exception[0]
              );
              // replace them in the temp
              tempObject.exception = tempSelect;
              bcfMap[binding.s.value] = tempObject;
            } else {
              Object.assign(
                tempObject,
                sparqlConverter.toViewpointJson(binding)
              );
              bcfMap[binding.s.value] = tempObject;
            }
          } else {
            Object.assign(tempObject, sparqlConverter.toViewpointJson(binding));
            bcfMap[binding.s.value] = tempObject;
          }
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toViewpointJson(binding);
        }
      }
      for (object in bcfMap) {
        var tempComponents = {};
        var tempVisibility = {};
        var tempSetupHints = {};
        var tempSelection = {};
        var tempException = {};
        var tempViewpoint = {};
        if (
          bcfMap[object].perspective_camera ||
          bcfMap[object].orthogonal_camera
        ) {
          var viewpointValues = bcfMap[object];

          if (bcfMap[object].perspective_camera) {
            perspectiveCamera = bcfMap[object].perspective_camera;
            tempViewpoint["perspective_camera"] = bcfMap[perspectiveCamera];
          } else if (bcfMap[object].orthogonal_camera) {
            orthogonalCamera = bcfMap[object].orthogonal_camera;
            tempViewpoint["orthogonal_camera"] = bcfMap[orthogonalCamera];
          }

          if (bcfMap[object].selection) {
            console.log(bcfMap[object].selection);
            selectionArr = bcfMap[object].selection;
            tempSelectionArr = [];
            for (selection in selectionArr) {
              console.log(bcfMap[selectionArr[selection]]);
              tempSelectionArr.push(bcfMap[selectionArr[selection]]);
            }
            tempSelection = tempSelectionArr;
          }

          if (bcfMap[object].exception) {
            exceptionArr = bcfMap[object].exception;
            tempExceptionArr = [];
            for (exception in exceptionArr) {
              tempExceptionArr.push(bcfMap[exceptionArr[exception]]);
            }
            tempException = tempExceptionArr;
          }

          tempViewpoint["guid"] = viewpointValues.guid;
          tempViewpoint["topic_guid"] = viewpointValues.topic_guid;
          tempViewpoint["originating_document"] =
            viewpointValues.originating_document;

          tempSetupHints["spaces_visible"] = viewpointValues.spaces_visible;
          tempSetupHints["space_boundaries_visible"] =
            viewpointValues.space_boundaries_visible;
          tempSetupHints["openings_visible"] = viewpointValues.openings_visible;

          tempVisibility["default_visibility"] =
            viewpointValues.default_visibility;
          tempVisibility["view_setup_hints"] = tempSetupHints;
          tempVisibility["exceptions"] = tempException;

          tempComponents["visibility"] = tempVisibility;
          tempComponents["selection"] = tempSelection;

          tempViewpoint["components"] = tempComponents;

          bcfReturn.push(tempViewpoint);
        }
      }
      // console.log(bcfMap);
      res.status(200).json(bcfReturn);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.get_viewpoint = (req, res, created) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var viewpointId = req.params.viewpointId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  if (created.bCreated == true) {
    var bCreated = created.bCreated;
    viewpointId = created.viewpointId;
  }

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#> 
    PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>

    SELECT DISTINCT ?s ?p ?o WHERE {
    {
        SELECT *
        WHERE {
            ?s	bcfOWL:hasTopic project:${topicId} .
            ?s	bcfOWL:hasGuid	"${viewpointId}" .
            ?s 	a 	bcfOWL:Viewpoint ;
                ?p	?o .
        }
    } UNION {
        SELECT *
        WHERE {
            ?x	bcfOWL:hasTopic project:${topicId} .
            ?x	bcfOWL:hasGuid	"${viewpointId}" .
            ?x	bcfOWL:hasPerspectiveCamera ?s .
            ?s	a	bcfOWL:PerspectiveCamera ;
                ?p ?o .
        }
    } UNION {
        SELECT *
        WHERE {
            ?x	bcfOWL:hasTopic project:${topicId} .
            ?x	bcfOWL:hasGuid	"${viewpointId}" .
            ?x	bcfOWL:hasSelection ?s .
            ?s	a bcfOWL:Component;
                ?p ?o .
        }
    } UNION {
        SELECT *
        WHERE {
            ?x	bcfOWL:hasTopic project:${topicId} .
            ?x	bcfOWL:hasGuid	"${viewpointId}" .
            ?x	bcfOWL:hasException ?s .
            ?s	a bcfOWL:Component;
                ?p ?o .
        }
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

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var bcfMap = {};
      var bcfReturn = [];
      for (value in result.results.bindings) {
        var binding = result.results.bindings[value];

        if (bcfMap[binding.s.value]) {
          tempObject = bcfMap[binding.s.value];
          // check if the value is a selection
          if (sparqlConverter.toViewpointJson(binding).selection) {
            // check if the viewpoint already has a selection
            if (tempObject.selection) {
              var tempSelect = tempObject.selection;
              // add the selection to the other ones
              tempSelect.push(
                sparqlConverter.toViewpointJson(binding).selection[0]
              );
              // replace them in the temp
              tempObject.selection = tempSelect;
              bcfMap[binding.s.value] = tempObject;
            } else {
              Object.assign(
                tempObject,
                sparqlConverter.toViewpointJson(binding)
              );
              bcfMap[binding.s.value] = tempObject;
            }
          } else if (sparqlConverter.toViewpointJson(binding).exception) {
            // check if the viewpoint already has a exception
            if (tempObject.exception) {
              var tempSelect = tempObject.exception;
              // add the exception to the other ones
              tempSelect.push(
                sparqlConverter.toViewpointJson(binding).exception[0]
              );
              // replace them in the temp
              tempObject.exception = tempSelect;
              bcfMap[binding.s.value] = tempObject;
            } else {
              Object.assign(
                tempObject,
                sparqlConverter.toViewpointJson(binding)
              );
              bcfMap[binding.s.value] = tempObject;
            }
          } else {
            Object.assign(tempObject, sparqlConverter.toViewpointJson(binding));
            bcfMap[binding.s.value] = tempObject;
          }
        } else {
          bcfMap[binding.s.value] = sparqlConverter.toViewpointJson(binding);
        }
      }
      for (object in bcfMap) {
        var tempComponents = {};
        var tempVisibility = {};
        var tempSetupHints = {};
        var tempSelection = {};
        var tempException = {};
        var tempViewpoint = {};
        if (
          bcfMap[object].perspective_camera ||
          bcfMap[object].orthogonal_camera
        ) {
          var viewpointValues = bcfMap[object];

          if (bcfMap[object].perspective_camera) {
            perspectiveCamera = bcfMap[object].perspective_camera;
            tempViewpoint["perspective_camera"] = bcfMap[perspectiveCamera];
          } else if (bcfMap[object].orthogonal_camera) {
            orthogonalCamera = bcfMap[object].orthogonal_camera;
            tempViewpoint["orthogonal_camera"] = bcfMap[orthogonalCamera];
          }

          if (bcfMap[object].selection) {
            selectionArr = bcfMap[object].selection;
            tempSelectionArr = [];
            for (selection in selectionArr) {
              tempSelectionArr.push(bcfMap[selectionArr[selection]]);
            }
            tempSelection = tempSelectionArr;
          }

          if (bcfMap[object].exception) {
            exceptionArr = bcfMap[object].exception;
            tempExceptionArr = [];
            for (exception in exceptionArr) {
              tempExceptionArr.push(bcfMap[exceptionArr[exception]]);
            }
            tempException = tempExceptionArr;
          }

          tempViewpoint["guid"] = viewpointValues.guid;
          tempViewpoint["topic_guid"] = viewpointValues.topic_guid;
          tempViewpoint["snapshot_type"] = viewpointValues.snapshot_type;

          tempSetupHints["spaces_visible"] = viewpointValues.spaces_visible;
          tempSetupHints["space_boundaries_visible"] =
            viewpointValues.space_boundaries_visible;
          tempSetupHints["openings_visible"] = viewpointValues.openings_visible;

          tempVisibility["default_visibility"] =
            viewpointValues.default_visibility;
          tempVisibility["view_setup_hints"] = tempSetupHints;
          tempVisibility["exceptions"] = tempException;

          tempComponents["visibility"] = tempVisibility;
          tempComponents["selection"] = tempSelection;

          tempViewpoint["components"] = tempComponents;

          bcfReturn.push(tempViewpoint);
        }
      }
      if (bCreated == true) {
        res.status(201).json(bcfReturn[0]);
      } else {
        res.status(200).json(bcfReturn[0]);
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_viewpoint = (req, res, next) => {
  console.log("Post Viewpoint");
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;

  if (req.body.guid) {
    var viewpointId = req.body.guid;
  } else {
    var viewpointId = uuid.v4();
  }

  var file64 = req.body.snapshot.snapshot_data;
  var decodedFile = new Buffer.from(file64, "base64");

  var formdata = new FormData();
  formdata.append(
    "fileStream",
    decodedFile,
    `${viewpointId}.${req.body.snapshot.snapshot_type}`
  );

  var fileHeader = new fetch.Headers();
  fileHeader.append("Authorization", "Basic " + fuseki.fileauth());

  var requestOptions = {
    method: "POST",
    headers: fileHeader,
    body: formdata,
    redirect: "follow",
  };

  const fileUrl =
    process.env.FILESERVER_URL +
    `${projectId}/${viewpointId}.${req.body.snapshot.snapshot_type}`;

  fetch(fileUrl, requestOptions)
    .then((response) => response)
    .then((result) => {
      //TODO: Write Utility for checking codes!
      if (result.status == 201) {
        var myHeaders = new fetch.Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", "Basic " + fuseki.auth());

        var urlencoded = new URLSearchParams();
        urlencoded.append(
          "update",
          `
              PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
              PREFIX project: <${process.env.BCF_URL}graph/${projectId}/>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
              PREFIX geo: <http://www.opengis.net/ont/geosparql#>
              
              INSERT {
                project:${viewpointId} a bcfOWL:Viewpoint ;
                  bcfOWL:hasGuid "${viewpointId}"^^xsd:string ;
                  bcfOWL:hasTopic project:${topicId} ;
                  bcfOWL:hasSnapshot "${process.env.BCF_URL}files/${projectId}/${viewpointId}.${req.body.snapshot.snapshot_type}"^^xsd:anyURI ;
                  bcfOWL:hasProject project:${projectId} ;\n` +
            sparqlConverter.toViewpointSPARQL(req) +
            `} WHERE {
                  ?s ?p ?o
                  FILTER NOT EXISTS { project:${viewpointId} ?p ?o} 
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
            this.get_viewpoint(req, res, {
              bCreated: true,
              viewpointId: viewpointId,
            });
            // res.status(201).json({
            //   guid: viewpointId,
            //   index: req.body.index,
            //   perspective_camera: req.body.perspective_camera,
            //   snapshot: {
            //     snapshot_type: req.body.snapshot.snapshot_type,
            //   },
            // });
          })
          .catch((error) => {
            console.log("error", error);
          });
      }
    })
    .catch((error) => console.log("error", error));
};

exports.get_snapshot = (req, res, next) => {
  const projectId = req.params.projectId;
  const viewpointId = req.params.viewpointId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>

    SELECT ?o
    WHERE {
      ?s a bcfOWL:Viewpoint;
         bcfOWL:hasGuid "${viewpointId}";
         bcfOWL:hasSnapshot ?o
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
      var snapshotUrl = result.results.bindings[0].o.value;
      // split the Url so we just get the name
      var snapshotSplit = snapshotUrl.split("/");
      var snapshotName = snapshotSplit[snapshotSplit.length - 1];

      var fileHeader = new fetch.Headers();
      fileHeader.append("Authorization", "Basic " + fuseki.fileauth());

      var requestOptions = {
        method: "GET",
        headers: fileHeader,
        redirect: "follow",
      };

      fetch(
        process.env.FILESERVER_URL + `${projectId}/${snapshotName}`,
        requestOptions
      )
        .then((response) => response.arrayBuffer())
        .then((result) => {
          var data = result;
          var buff = new Buffer.from(data, "");

          res.status(200).send(buff);
        })
        .catch((error) => {
          res.status(400).json(error);
        });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};
