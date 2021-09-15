const fetch = require("node-fetch");
const sparqlConverter = require("./Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("./Utilities/FusekiUtilities");

exports.get_all_viewpoints = (req, res, next) => {
  const projectId = req.params.projectId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    \nPREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/> 
    \nPREFIX project: <${process.env.BCF_URL + projectId}#>
    \nPREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    \nSELECT DISTINCT ?s ?p ?o WHERE {
        \n{
        \nSELECT *
        \nWHERE {
            \n?s 	a 	bcfOWL:Viewpoint ;
            \n?p	?o .
        \n}
          \n} UNION {
        \nSELECT *
          \nWHERE {
            \n?x	bcfOWL:hasPerspectiveCamera ?s .
              \n?s	a	bcfOWL:PerspectiveCamera ;
              \n?p ?o .
                  \n}
        \n} UNION {
        \nSELECT *
          \nWHERE {
            \n?x	bcfOWL:hasSelection ?s .
              \n?s	a bcfOWL:Component;
              \n?p ?o .
                \n}
        \n} UNION {
        \nSELECT *
          \nWHERE {
            \n?x	bcfOWL:hasException ?s .
              \n?s	a bcfOWL:Component;
            \n?p ?o .
                \n}
        \n }
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
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/> 
    PREFIX project: <${process.env.BCF_URL + projectId}#>
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

exports.get_viewpoint = (req, res, next) => {
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  const viewpointId = req.params.viewpointId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/> 
    PREFIX project: <${process.env.BCF_URL + projectId}#>
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
      res.status(200).json(bcfReturn[0]);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.post_viewpoint = (req, res, next) => {
  console.log("Test");
  const projectId = req.params.projectId;
  const topicId = req.params.topicId;
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  if (req.body.guid) {
    viewpointId = req.body.guid;
  } else {
    viewpointId = uuid.v4();
  }

  //TODO: Add Snapshot
  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "update",
    `
    PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL/>
    PREFIX project: <${process.env.BCF_URL + projectId}#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    
    INSERT {
      project:${viewpointId} a bcfOWL:Viewpoint ;
        bcfOWL:hasGuid "${viewpointId}"^^xsd:string ;
        bcfOWL:hasTopic project:${topicId} ;
        bcfOWL:hasProject project:${projectId} ;\n` +
      sparqlConverter.toViewpointSPARQL(req) +
      `} WHERE {
        ?s ?p ?o
        FILTER NOT EXISTS { project:${viewpointId} ?p ?o} 
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
