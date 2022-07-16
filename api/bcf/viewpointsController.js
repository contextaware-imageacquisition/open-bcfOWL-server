const fetch = require("node-fetch");
const FormData = require("form-data");
const sparqlConverter = require("../Utilities/SparqlJsonConverter");
const uuid = require("uuid");
const fuseki = require("../Utilities/FusekiUtilities");
const jwt = require("jsonwebtoken");
const wkt = require("wkt");

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
  myHeaders.append("Accept", "application/ld+json");

  var urlencoded = new URLSearchParams();
  urlencoded.append(
    "query",
    `
    CONSTRUCT {?s ?p ?o}
      WHERE {
        { 
          ?s <http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic> ?t.
        ?t <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${topicId}".
          
          ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Viewpoint>;
            ?p ?o.
        }
        UNION
        { 
          ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasPerspectiveCamera> ?s.
        ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic> ?t.
        ?t <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${topicId}".
      
          ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#PerspectiveCamera>;
            ?p ?o. 
        } UNION { 
          ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasClippingPlane> ?s.
        ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic> ?t.
        ?t <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${topicId}".
      
          ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#ClippingPlane>;
            ?p ?o. 
        } UNION { 
          ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasException> ?s.
        ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic> ?t.
        ?t <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${topicId}".
      
          ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Exception>;
            ?p ?o. 
        } UNION { 
          ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasSelection> ?s.
        ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic> ?t.
        ?t <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${topicId}".
      
          ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Selection>;
            ?p ?o. 
        }
      }
    `
  );

  console.log("test");
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      let responseJson = [];

      let graph = result["@graph"];

      for (object of graph) {
        let viewpointObject = {};
        let clipping_planes = [];
        console.log("object", object);
        if (
          object["@type"] === "http://lbd.arch.rwth-aachen.de/bcfOWL#Viewpoint"
        ) {
          viewpointObject.guid = object.hasGuid;
          viewpointObject.index = object.hasIndex;
          for (pc of graph) {
            if (
              pc["@type"] ===
              "http://lbd.arch.rwth-aachen.de/bcfOWL#PerspectiveCamera"
            ) {
              viewpointObject.perspectie_camera = {
                camera_view_point: {
                  x: wkt.parse(pc.hasCameraViewPoint).coordinates[0],
                  y: wkt.parse(pc.hasCameraViewPoint).coordinates[1],
                  z: wkt.parse(pc.hasCameraViewPoint).coordinates[2],
                },
                camera_direction: {
                  x: wkt.parse(pc.hasCameraDirection).coordinates[0],
                  y: wkt.parse(pc.hasCameraDirection).coordinates[1],
                  z: wkt.parse(pc.hasCameraDirection).coordinates[2],
                },
                camera_up_vector: {
                  x: wkt.parse(pc.hasCameraUpVector).coordinates[0],
                  y: wkt.parse(pc.hasCameraUpVector).coordinates[1],
                  z: wkt.parse(pc.hasCameraUpVector).coordinates[2],
                },
              };
            }
          }
          for (cp of graph) {
            if (
              cp["@type"] ===
              "http://lbd.arch.rwth-aachen.de/bcfOWL#ClippingPlane"
            ) {
              clipping_planes.push({
                location: {
                  x: wkt.parse(cp.hasLocation).coordinates[0],
                  y: wkt.parse(cp.hasLocation).coordinates[1],
                  z: wkt.parse(cp.hasLocation).coordinates[2],
                },
                direction: {
                  x: wkt.parse(cp.hasDirection).coordinates[0],
                  y: wkt.parse(cp.hasDirection).coordinates[1],
                  z: wkt.parse(cp.hasDirection).coordinates[2],
                },
              });
            }
          }
          viewpointObject.clipping_planes = clipping_planes;
          responseJson.push(viewpointObject);
          console.log(viewpointObject);
        }
      }
      res.status(200).json(responseJson);
      /* var bcfMap = {};
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
      res.status(200).json(bcfReturn); */
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
  myHeaders.append("Accept", "application/ld+json");

  if (created.bCreated == true) {
    var bCreated = created.bCreated;
    viewpointId = created.viewpointId;
  }

  var query = `
    
  CONSTRUCT {?s ?p ?o}
  WHERE {
    { 
      ?s <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${viewpointId}".
      
      ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Viewpoint>;
        ?p ?o.
    }
    UNION
    { 
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasPerspectiveCamera> ?s.
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${viewpointId}".
      ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#PerspectiveCamera>;
        ?p ?o. 
    } UNION { 
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasClippingPlane> ?s.
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${viewpointId}".
      ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#ClippingPlane>;
        ?p ?o. 
    } UNION { 
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasException> ?s.
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${viewpointId}".
      ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Exception>;
        ?p ?o. 
    } UNION { 
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasSelection> ?s.
      ?vp <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "${viewpointId}".
      ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Selection>;
        ?p ?o. 
    }
  }
        `;

  var urlencoded = new URLSearchParams();
  urlencoded.append("query", query);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(process.env.FUSEKI_URL + projectId, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      let returnJson = {};
      let planes = [];
      let graph = result["@graph"];

      for (object of graph) {
        if (
          object["@type"] === "http://lbd.arch.rwth-aachen.de/bcfOWL#Viewpoint"
        ) {
          returnJson.guid = object.hasGuid;
          returnJson.index = object.hasIndex;
          returnJson.snapshot = { snapshot_type: object.hasSnapshotType };
        } else if (
          object["@type"] ===
          "http://lbd.arch.rwth-aachen.de/bcfOWL#PerspectiveCamera"
        ) {
          returnJson.perspective_camera = {
            camera_view_point: {
              x: wkt.parse(object.hasCameraViewPoint).coordinates[0],
              y: wkt.parse(object.hasCameraViewPoint).coordinates[1],
              z: wkt.parse(object.hasCameraViewPoint).coordinates[2],
            },
            camera_direction: {
              x: wkt.parse(object.hasCameraDirection).coordinates[0],
              y: wkt.parse(object.hasCameraDirection).coordinates[1],
              z: wkt.parse(object.hasCameraDirection).coordinates[2],
            },
            camera_up_vector: {
              x: wkt.parse(object.hasCameraUpVector).coordinates[0],
              y: wkt.parse(object.hasCameraUpVector).coordinates[1],
              z: wkt.parse(object.hasCameraUpVector).coordinates[2],
            },
            field_of_view: object.hasFieldOfView,
            aspect_ratio: object.hasAspectRatio,
          };
        } else if (
          object["@type"] ===
          "http://lbd.arch.rwth-aachen.de/bcfOWL#ClippingPlane"
        ) {
          planes.push({
            location: {
              x: wkt.parse(object.hasLocation).coordinates[0],
              y: wkt.parse(object.hasLocation).coordinates[1],
              z: wkt.parse(object.hasLocation).coordinates[2],
            },
            direction: {
              x: wkt.parse(object.hasDirection).coordinates[0],
              y: wkt.parse(object.hasDirection).coordinates[1],
              z: wkt.parse(object.hasDirection).coordinates[2],
            },
          });
        }
      }
      returnJson.clipping_planes = planes;

      if (bCreated == true) {
        res.status(201).json(returnJson);
      } else {
        res.status(200).json(returnJson);
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
      console.log(result);
      //TODO: Write Utility for checking codes!
      if (result.status == 201) {
        var myHeaders = new fetch.Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", "Basic " + fuseki.auth());

        var update =
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
    `;

        var urlencoded = new URLSearchParams();
        urlencoded.append("update", update);

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
    .catch((error) => {
      res.status(500).json(error);
      console.log("error", error);
    });
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
