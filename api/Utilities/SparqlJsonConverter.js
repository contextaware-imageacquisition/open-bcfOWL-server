const uuid = require("uuid");
const guid = require("./GuidConverter");

function splitURI(URI) {
  if (URI.split("#").length > 1) {
    var stringArray = URI.split("#");
  } else {
    var stringArray = URI.split("/");
  }
  var string = stringArray[stringArray.length - 1];
  return string.replace("_", " ");
}

function setExtensionString(extension) {
  string = "";

  for (value in extension) {
    string += ` project:${extension[value].replace(" ", "_")},`;
  }
  string = string.slice(0, -1) + ";";

  return string;
}

function toTopicJson(binding, users) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasIndex"
  ) {
    convertedValue["index"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTitle"
  ) {
    convertedValue["title"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCreationAuthor"
  ) {
    value = binding.o.value;
    convertedValue["creation_author"] = users[value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasModifiedAuthor"
  ) {
    value = binding.o.value;
    convertedValue["modified_author"] = users[value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopicStatus"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_status"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasAssignedTo"
  ) {
    value = binding.o.value;
    convertedValue["assigned_to"] = users[value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopicType"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_type"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasLabels"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["labels"] = [stringArray[stringArray.length - 1]];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCreationDate"
  ) {
    convertedValue["creation_date"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasModifiedDate"
  ) {
    convertedValue["modified_date"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasPriority"
  ) {
    value = binding.o.value;

    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }

    convertedValue["priority"] = stringArray[stringArray.length - 1];
  }

  return convertedValue;
}

function toDocumentJson(binding) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasFilename"
  ) {
    convertedValue["filename"] = binding.o.value;
  }

  return convertedValue;
}

function toDocumentRefJson(result) {
  var convertedValue = {};
  bindings = result.results.bindings;

  for (binding in bindings) {
    var documentRefValues = {};
    console.log(bindings[binding].p.value);
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid"
    ) {
      var guid =
        bindings[binding].s.value.split("/")[
          bindings[binding].s.value.split("/").length - 1
        ];
      if (convertedValue[guid]) {
        documentRefValues = convertedValue[guid];
        documentRefValues["guid"] = bindings[binding].o.value;
      } else {
        documentRefValues["guid"] = bindings[binding].o.value;
        convertedValue[guid] = documentRefValues;
      }
    } else if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasDescription"
    ) {
      var guid =
        bindings[binding].s.value.split("/")[
          bindings[binding].s.value.split("/").length - 1
        ];
      if (convertedValue[guid]) {
        documentRefValues = convertedValue[guid];
        documentRefValues["description"] = bindings[binding].o.value;
      } else {
        documentRefValues["description"] = bindings[binding].o.value;
        convertedValue[guid] = documentRefValues;
      }
    } else if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasDocument"
    ) {
      var guid =
        bindings[binding].s.value.split("/")[
          bindings[binding].s.value.split("/").length - 1
        ];
      if (convertedValue[guid]) {
        documentRefValues = convertedValue[guid];
        documentRefValues["document_guid"] =
          bindings[binding].o.value.split("/")[
            bindings[binding].o.value.split("/").length - 1
          ];
      } else {
        documentRefValues["document_guid"] =
          bindings[binding].o.value.split("/")[
            bindings[binding].o.value.split("/").length - 1
          ];
        convertedValue[guid] = documentRefValues;
      }
    }
  }

  return convertedValue;
}

function toSpatialJson(binding) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasAlignment") {
    convertedValue["alignment"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasLocation"
  ) {
    var value = binding.o.value;
    value = value.replace("POINT Z(", "");
    value = value.replace(")", "");
    var vectorArr = value.split(" ");
    var vector = {
      x: vectorArr[0] * 1,
      y: vectorArr[1] * 1,
      z: vectorArr[2] * 1,
    };
    convertedValue["location"] = vector;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasRotation"
  ) {
    var value = binding.o.value;
    value = value.replace("POINT Z(", "");
    value = value.replace(")", "");
    var vectorArr = value.split(" ");
    var vector = {
      x: vectorArr[0] * 1,
      y: vectorArr[1] * 1,
      z: vectorArr[2] * 1,
    };
    convertedValue["rotation"] = vector;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasScale"
  ) {
    var value = binding.o.value;
    value = value.replace("POINT Z(", "");
    value = value.replace(")", "");
    var vectorArr = value.split(" ");
    var vector = {
      x: vectorArr[0] * 1,
      y: vectorArr[1] * 1,
      z: vectorArr[2] * 1,
    };
    convertedValue["scale"] = vector;
  }

  return convertedValue;
}

function toProjectJson(binding) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid") {
    convertedValue["project_id"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasName"
  ) {
    convertedValue["name"] = binding.o.value;
  }

  return convertedValue;
}

function toCommentJson(binding, users) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic"
  ) {
    value = binding.o.value;
    console.log(value.split("#"));
    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_guid"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasComment"
  ) {
    convertedValue["comment"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasAuthor"
  ) {
    value = binding.o.value;
    convertedValue["author"] = users[value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasModifiedAuthor"
  ) {
    value = binding.o.value;
    convertedValue["modified_author"] = users[value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCommentDate"
  ) {
    convertedValue["date"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCommentModifiedDate"
  ) {
    convertedValue["modified_date"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasViewpoint"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["viewpoint_guid"] = stringArray[stringArray.length - 1];
  }

  return convertedValue;
}

function toViewpointJson(binding) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 1) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_guid"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasSnapshotType"
  ) {
    value = binding.o.value;
    convertedValue["snapshot_type"] = value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasOriginatingDocument"
  ) {
    console.log("#############ORIGINATING############");
    value = binding.o.value;
    convertedValue["originating_document"] = value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#SpacesVisible"
  ) {
    convertedValue["spaces_visibile"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#SpaceBoundariesVisible"
  ) {
    convertedValue["space_boundaries_visible"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#OpeningsVisible"
  ) {
    convertedValue["openings_visible"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasDefaulVisibility"
  ) {
    convertedValue["default_visibility"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCameraViewPoint"
  ) {
    var value = binding.o.value;
    value = value.replace("POINT Z(", "");
    value = value.replace(")", "");
    var vectorArr = value.split(" ");
    var vector = {
      x: vectorArr[0] * 1,
      y: vectorArr[1] * 1,
      z: vectorArr[2] * 1,
    };
    convertedValue["camera_view_point"] = vector;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCameraDirection"
  ) {
    var value = binding.o.value;
    value = value.replace("POINT Z(", "");
    value = value.replace(")", "");
    var vectorArr = value.split(" ");
    var vector = {
      x: vectorArr[0] * 1,
      y: vectorArr[1] * 1,
      z: vectorArr[2] * 1,
    };
    convertedValue["camera_direction"] = vector;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasCameraUpVector"
  ) {
    var value = binding.o.value;
    value = value.replace("POINT Z(", "");
    value = value.replace(")", "");
    var vectorArr = value.split(" ");
    var vector = {
      x: vectorArr[0] * 1,
      y: vectorArr[1] * 1,
      z: vectorArr[2] * 1,
    };
    convertedValue["camera_up_vector"] = vector;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasFieldOfView"
  ) {
    convertedValue["field_of_view"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasAspectRatio"
  ) {
    convertedValue["aspect_ratio"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasPerspectiveCamera"
  ) {
    convertedValue["perspective_camera"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasIfcGuid"
  ) {
    convertedValue["ifc_guid"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL#hasOriginatingSystem"
  ) {
    console.log(
      binding.o.value.split("/")[binding.o.value.split("/").length - 1]
    );
    convertedValue["originating_system"] =
      binding.o.value.split("/")[binding.o.value.split("/").length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasSelection"
  ) {
    convertedValue["selection"] = [binding.o.value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasException"
  ) {
    convertedValue["exception"] = [binding.o.value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL#hasComponent"
  ) {
    convertedValue[binding.o.value] = "";
  }

  return convertedValue;
}

function toExtensionJson(response, users, version) {
  var bindings = response.results.bindings;
  var extensions = {};
  var types = [];
  var status = [];
  var labels = [];
  var priorities = [];
  var userMails = [];
  var stages = [];

  for (binding in bindings) {
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasLabels"
    ) {
      value = bindings[binding].o.value;
      labels.push(splitURI(value));
    }
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopicStatus"
    ) {
      value = bindings[binding].o.value;
      status.push(splitURI(value));
    }
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopicType"
    ) {
      value = bindings[binding].o.value;
      types.push(splitURI(value));
    }
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasPriority"
    ) {
      value = bindings[binding].o.value;
      priorities.push(splitURI(value));
    }
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasStage"
    ) {
      value = bindings[binding].o.value;
      stages.push(splitURI(value));
    }
    if (
      bindings[binding].p.value ==
      "http://lbd.arch.rwth-aachen.de/bcfOWL#hasUser"
    ) {
      value = bindings[binding].o.value;
      console.log(value);
      userMails.push(users[value]);
    }
  }
  extensions["topic_type"] = types;
  extensions["topic_status"] = status;
  extensions["topic_label"] = labels;
  extensions["priority"] = priorities;
  if (version == "2.1") {
    extensions["user_id_type"] = userMails;
  } else {
    extensions["users"] = userMails;
  }

  extensions["stage"] = stages;

  return extensions;
}

function toExtensionSPARQL(request, usersUris) {
  var query = "";
  const types = request.topic_type;
  const status = request.topic_status;
  const label = request.topic_label;
  const priority = request.priority;
  const users = usersUris;
  const stages = request.stage;

  if (types) {
    query += `\nbcfOWL:hasTopicType` + setExtensionString(types);
  }

  if (status) {
    query += `\nbcfOWL:hasTopicStatus` + setExtensionString(status);
  }

  if (label) {
    query += `\nbcfOWL:hasLabels` + setExtensionString(label);
  }

  if (priority) {
    query += `\nbcfOWL:hasPriority` + setExtensionString(priority);
  }

  if (stages) {
    query += `\nbcfOWL:hasStage` + setExtensionString(stages);
  }

  if (users) {
    console.log(users);
    for (user in users) {
      query += `\nbcfOWL:hasUser`;
      query += ` <${users[user]}>;`;
    }
  }

  return query;
}
// Converts a BCF JSON Topic Request body to SPARQL Queries
function toTopicSPARQL(request, assignedTo) {
  var sparqlString = "";

  if (request.body.title) {
    sparqlString += `\n bcfOWL:hasTitle "${request.body.title}"^^xsd:string ;`;
  }

  if (request.body.topic_type) {
    sparqlString += `\n bcfOWL:hasTopicType project:${request.body.topic_type} ;`;
  }

  if (request.body.topic_status) {
    sparqlString += `\n bcfOWL:hasTopicStatus project:${request.body.topic_status} ;`;
  }

  if (request.body.priority) {
    sparqlString += `\n bcfOWL:hasPriority project:${request.body.priority} ;`;
  }

  if (assignedTo.length > 0) {
    sparqlString += `\n bcfOWL:hasAssignedTo <${assignedTo}> ;`;
  }

  if (request.body.stage) {
    sparqlString += `\n bcfOWL:hasStage project:${request.body.stage};`;
  }

  if (request.body.labels) {
    var labelString = "";
    for (label in request.body.labels) {
      labelString += ` project:${request.body.labels[label]}, `;
    }
    labelString = labelString.slice(0, -2);
    console.log(labelString.toString());
    if (labelString != "") {
      sparqlString += ` \n  bcfOWL:hasLabels${labelString} .`;
    }
  }

  return sparqlString;
}

function toUserSPARQL(user) {
  var users = user;
  var query = "";
  for (user in users) {
    if (user == 0) {
      query += `{\n ?s foaf:mbox <mailto:${users[user]}>}`;
    } else {
      query += ` UNION {  
        \n ?s foaf:mbox <mailto:${users[user]}>}`;
    }
  }
  return query;
}

// Converts a BCF JSON Comment Request body to SPARQL Queries
function toCommentSPARQL(request) {
  var sparqlString = "";

  if (request.body.comment) {
    sparqlString += `\n bcfOWL:hasComment "${request.body.comment}"^^xsd:string ;`;
  }

  if (request.body.viewpoint_guid) {
    sparqlString += `\n bcfOWL:hasViewpoint project:${request.body.viewpoint_guid} ;`;
  }

  sparqlString = sparqlString.slice(0, -1) + ". \n";

  return sparqlString;
}

// Converts a BCF JSON Comment Request body to SPARQL Queries
function toViewpointSPARQL(request) {
  var sparqlString = " ";
  var cameraId = uuid.v4();
  var perspective_camera = "";
  var orthogonal_camera = "";
  var selection = "";
  var exception = "";

  if (request.body.perspective_camera) {
    sparqlString += `\n bcfOWL:hasPerspectiveCamera project:${cameraId} ;`;
    console.log(request.body.perspective_camera.field_of_view);
    var aspectRatio;
    if (request.body.perspective_camera.aspect_ratio) {
      aspectRatio = request.body.perspective_camera.aspect_ratio;
    } else {
      aspectRatio = 0;
    }
    perspective_camera += `
                    \n project:${cameraId}
                      a                          bcfOWL:PerspectiveCamera ;
                      bcfOWL:hasAspectRatio      "${request.body.perspective_camera.aspect_ratio}"^^xsd:float ;
                      bcfOWL:hasCameraDirection  "POINT Z(${request.body.perspective_camera.camera_direction.x} ${request.body.perspective_camera.camera_direction.y} ${request.body.perspective_camera.camera_direction.z})"^^geo:wktLiteral ;
                      bcfOWL:hasCameraUpVector   "POINT Z(${request.body.perspective_camera.camera_up_vector.x} ${request.body.perspective_camera.camera_up_vector.y} ${request.body.perspective_camera.camera_up_vector.z})"^^geo:wktLiteral ;
                      bcfOWL:hasCameraViewPoint  "POINT Z(${request.body.perspective_camera.camera_view_point.x} ${request.body.perspective_camera.camera_view_point.y} ${request.body.perspective_camera.camera_view_point.z})"^^geo:wktLiteral ;
                      bcfOWL:hasFieldOfView      "${request.body.perspective_camera.field_of_view}"^^xsd:float .
    `;
  }

  //TODO: add else: orthogonal camera
  // if (request.body.orthogonal_camera) {
  //   sparqlString += `\n bcfOWL:hasOrthogonalCamera project:${cameraId} ;`;
  // }

  if (request.body.components.selection) {
    var selectionString = "";

    for (selectionElement in request.body.components.selection) {
      // convert guid from compressed to full
      selectionString += ` project:${guid.Guid.fromCompressedToFull(
        request.body.components.selection[selectionElement].ifc_guid
      )}, `;

      // constructing the selection components

      if (request.body.components.selection[selectionElement].ifc_guid) {
        var componentString = `\n project:${guid.Guid.fromCompressedToFull(
          request.body.components.selection[selectionElement].ifc_guid
        )} a bcfOWL:Component ;`;
      }
      if (
        request.body.components.selection[selectionElement].originating_system
      ) {
        componentString += `\n bcfOWL:hasOriginatingSystem  project:${request.body.components.selection[selectionElement].originating_system} ;`;
      }
      if (
        request.body.components.selection[selectionElement].authoring_tool_id
      ) {
        componentString += `\n bcfOWL:hasAuthoringToolId  "${request.body.components.selection[selectionElement].authoring_tool_id}"^^xsd:string ;`;
      }
      if (request.body.components.selection[selectionElement].ifc_guid) {
        componentString += `\n bcfOWL:hasIfcGuid  "${request.body.components.selection[selectionElement].ifc_guid}"^^xsd:string ;`;
      }
      componentString = componentString.slice(0, -1) + `. \n`;

      selection += componentString;
    }

    if (selectionString != "") {
      sparqlString += `\n bcfOWL:hasSelection ${selectionString.slice(
        0,
        -2
      )} ;`;
    }
  }

  if (request.body.snapshot.snapshot_type) {
    sparqlString += `\n bcfOWL:hasSnapshotType "${request.body.snapshot.snapshot_type}"^^xsd:string ;`;
    //TODO: add bcfOWL:hasSnapshotType... find Ontology for Types?
  }

  if (request.body.components.visibility.exceptions) {
    var exceptionString = "";

    for (exceptionElement in request.body.components.visibility.exceptions) {
      exceptionString += ` project:${guid.Guid.fromCompressedToFull(
        request.body.components.visibility.exceptions[exceptionElement].ifc_guid
      )}, `;

      // constructing the selection components

      if (
        request.body.components.visibility.exceptions[exceptionElement].ifc_guid
      ) {
        var componentString = `\n project:${guid.Guid.fromCompressedToFull(
          request.body.components.visibility.exceptions[exceptionElement]
            .ifc_guid
        )} a bcfOWL:Component ;`;
      }
      //   var componentString = `project:${request.body.components.selection[selectionElement].authoring_tool_id} a bcfOWL:Component ;`;
      // }

      if (
        request.body.components.visibility.exceptions[exceptionElement]
          .originating_system
      ) {
        componentString += `\n bcfOWL:hasOriginatingSystem  project:${request.body.components.visibility.exceptions[exceptionElement].originating_system} ;`;
      }
      if (
        request.body.components.visibility.exceptions[exceptionElement]
          .authoring_tool_id
      ) {
        componentString += `\n bcfOWL:hasAuthoringToolId  "${request.body.components.visibility.exceptions[exceptionElement].authoring_tool_id}"^^xsd:string ;`;
      }
      if (
        request.body.components.visibility.exceptions[exceptionElement].ifc_guid
      ) {
        componentString += `\n bcfOWL:hasIfcGuid  "${request.body.components.visibility.exceptions[exceptionElement].ifc_guid}"^^xsd:string ;`;
      }
      componentString = componentString.slice(0, -1) + `. \n`;

      exception += componentString;
    }

    sparqlString += `\n bcfOWL:hasException ${exceptionString.slice(0, -2)} ;`;
  }

  if (
    request.body.components.visibility.view_setup_hints.openings_visible ==
      true ||
    request.body.components.visibility.view_setup_hints.openings_visible ==
      false
  ) {
    sparqlString += `\n bcfOWL:openingsVisible ${request.body.components.visibility.view_setup_hints.openings_visible} ;`;
  }

  if (
    request.body.components.visibility.view_setup_hints
      .space_boundaries_visible == true ||
    request.body.components.visibility.view_setup_hints
      .space_boundaries_visible == false
  ) {
    sparqlString += `\n bcfOWL:spaceBoundariesVisible ${request.body.components.visibility.view_setup_hints.space_boundaries_visible} ;`;
  }

  if (
    request.body.components.visibility.view_setup_hints.spaces_visible ==
      true ||
    request.body.components.visibility.view_setup_hints.spaces_visible == false
  ) {
    sparqlString += `\n bcfOWL:spacesVisible ${request.body.components.visibility.view_setup_hints.spaces_visible} ;`;
  }

  if (
    request.body.components.visibility.default_visibility == true ||
    request.body.components.visibility.default_visibility == false
  ) {
    sparqlString += `\n bcfOWL:hasDefaulVisibility ${request.body.components.visibility.default_visibility} ;`;
  }
  if (request.body.originating_document) {
    sparqlString += `\n bcfOWL:hasOriginatingDocument "${request.body.originating_document}"^^xsd:string ;`;
  }

  sparqlString = sparqlString.slice(0, -1);
  sparqlString += ".";
  sparqlString +=
    perspective_camera + orthogonal_camera + selection + exception;

  return sparqlString;
}

function toTopicSPARQLUpdate(request) {
  var sparqlString = "";

  if (request.body.title) {
    sparqlString += `\n ?s bcfOWL:hasTitle ?o .`;
  }

  if (request.body.topic_type) {
    sparqlString += `\n ?s bcfOWL:hasTopicType ?o .`;
  }

  if (request.body.topic_status) {
    sparqlString += `\n ?s bcfOWL:hasTopicStatus ?o .`;
  }

  if (request.body.priority) {
    sparqlString += `\n ?s bcfOWL:hasPriority ?o .`;
  }

  if (request.body.assigned_to) {
    sparqlString += `\n ?s bcfOWL:hasAssignedTo ?o .`;
  }

  if (request.body.stage) {
    sparqlString += `\n ?s bcfOWL:hasStage ?o .`;
  }

  if (request.body.stage) {
    sparqlString += `\n ?s bcfOWL:hasLabels ?o .`;
  }

  return sparqlString;
}

module.exports = {
  toTopicJson,
  toCommentJson,
  toViewpointJson,
  toTopicSPARQL,
  toCommentSPARQL,
  toViewpointSPARQL,
  toTopicSPARQLUpdate,
  toExtensionJson,
  toProjectJson,
  toExtensionSPARQL,
  toDocumentJson,
  toSpatialJson,
  toUserSPARQL,
  toDocumentRefJson,
};
