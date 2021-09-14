const uuid = require("uuid");
const guid = require("./GuidConverter");

function toTopicJson(binding) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasIndex"
  ) {
    convertedValue["index"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasTitle"
  ) {
    convertedValue["title"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCreationAuthor"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["creation_author"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasTopicStatus"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_status"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasAssignedTo"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["assigned_to"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasTopicType"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_type"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasLabels"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["labels"] = [stringArray[stringArray.length - 1]];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCreationDay"
  ) {
    convertedValue["creation_date"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasPriority"
  ) {
    value = binding.o.value;

    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }

    convertedValue["priority"] = stringArray[stringArray.length - 1];
  }

  return convertedValue;
}

function toCommentJson(binding) {
  var convertedValue = {};
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasTopic"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_guid"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasComment"
  ) {
    convertedValue["comment"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasAuthor"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["author"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasModifiedAuthor"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["modified_author"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCommentDate"
  ) {
    convertedValue["date"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCommentModifiedDate"
  ) {
    convertedValue["modified_date"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasViewpoint"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
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
  if (binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasGuid") {
    convertedValue["guid"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasTopic"
  ) {
    value = binding.o.value;
    if (value.split("#").length > 0) {
      var stringArray = value.split("#");
    } else {
      var stringArray = value.split("/");
    }
    convertedValue["topic_guid"] = stringArray[stringArray.length - 1];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/SpacesVisible"
  ) {
    convertedValue["spaces_visibile"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL/SpaceBoundariesVisible"
  ) {
    convertedValue["space_boundaries_visible"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/OpeningsVisible"
  ) {
    convertedValue["openings_visible"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL/hasDefaulVisibility"
  ) {
    convertedValue["default_visibility"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCameraViewPoint"
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
    "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCameraDirection"
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
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasCameraUpVector"
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
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasFieldOfView"
  ) {
    convertedValue["field_of_view"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasAspectRatio"
  ) {
    convertedValue["aspect_ratio"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL/hasPerspectiveCamera"
  ) {
    convertedValue["perspective_camera"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasIfcGuid"
  ) {
    convertedValue["ifc_guid"] = binding.o.value;
  } else if (
    binding.p.value ==
    "http://lbd.arch.rwth-aachen.de/bcfOWL/hasOriginatingSystem"
  ) {
    convertedValue["originating_system"] = binding.o.value;
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasSelection"
  ) {
    convertedValue["selection"] = [binding.o.value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasException"
  ) {
    convertedValue["exception"] = [binding.o.value];
  } else if (
    binding.p.value == "http://lbd.arch.rwth-aachen.de/bcfOWL/hasComponent"
  ) {
    convertedValue[binding.o.value] = "";
  }

  return convertedValue;
}

// Converts a BCF JSON Topic Request body to SPARQL Queries
function toTopicSPARQL(request) {
  var sparqlString = "";

  if (request.body.title) {
    sparqlString += `\n bcfOWL:hasTitle "${request.body.title}"^^xsd:string ;`;
  }

  if (request.body.topic_type) {
    sparqlString += `\n bcfOWL:hasTopicType inst:${request.body.topic_type} ;`;
  }

  if (request.body.topic_status) {
    sparqlString += `\n bcfOWL:hasTopicStatus inst:${request.body.topic_status} ;`;
  }

  if (request.body.priority) {
    sparqlString += `\n bcfOWL:hasPriority inst:${request.body.priority} ;`;
  }

  if (request.body.assigned_to) {
    sparqlString += `\n bcfOWL:hasAssignedTo inst:${request.body.assigned_to} ;`;
  }

  if (request.body.stage) {
    sparqlString += `\n bcfOWL:hasStage inst:${request.body.stage};`;
  }

  if (request.body.labels) {
    var labelString = "";
    for (label in request.body.labels) {
      labelString += ` inst:${request.body.labels[label]}, `;
    }
    labelString = labelString.slice(0, -2);
    console.log(labelString.toString());
    sparqlString += ` \n  bcfOWL:hasLabels${labelString} .`;
  }

  return sparqlString;
}

// Converts a BCF JSON Comment Request body to SPARQL Queries
function toCommentSPARQL(request) {
  var sparqlString = "";

  if (request.body.comment) {
    sparqlString += `\n bcfOWL:hasComment "${request.body.comment}"^^xsd:string ;`;
  }

  if (request.body.viewpoint_guid) {
    sparqlString += `\n bcfOWL:hasViewpoint inst:${request.body.viewpoint_guid} ;`;
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
    sparqlString += `\n bcfOWL:hasPerspectiveCamera inst:${cameraId} ;`;

    console.log("perspective ");
    perspective_camera += `
                    \n inst:${cameraId}
                      a                          bcfOWL:PerspectiveCamera ;
                      bcfOWL:hasAspectRatio      "${request.body.perspective_camera.aspect_ratio}"^^xsd:double ;
                      bcfOWL:hasCameraDirection  "POINT Z(${request.body.perspective_camera.camera_direction.x} ${request.body.perspective_camera.camera_direction.y} ${request.body.perspective_camera.camera_direction.z})"^^geo:wktLiteral ;
                      bcfOWL:hasCameraUpVector   "POINT Z(${request.body.perspective_camera.camera_up_vector.x} ${request.body.perspective_camera.camera_up_vector.y} ${request.body.perspective_camera.camera_up_vector.z})"^^geo:wktLiteral ;
                      bcfOWL:hasCameraViewPoint  "POINT Z(${request.body.perspective_camera.camera_view_point.x} ${request.body.perspective_camera.camera_view_point.y} ${request.body.perspective_camera.camera_view_point.z})"^^geo:wktLiteral ;
                      bcfOWL:hasFieldOfView      "${request.body.perspective_camera.field_of_view}"^^xsd:double .
    `;
  }

  //TODO: add else: orthogonal camera
  // if (request.body.orthogonal_camera) {
  //   sparqlString += `\n bcfOWL:hasOrthogonalCamera inst:${cameraId} ;`;
  // }

  if (request.body.components.selection) {
    var selectionString = "";

    for (selectionElement in request.body.components.selection) {
      // convert guid from compressed to full
      selectionString += ` inst:${guid.Guid.fromCompressedToFull(
        request.body.components.selection[selectionElement].ifc_guid
      )}, `;

      // constructing the selection components

      if (request.body.components.selection[selectionElement].ifc_guid) {
        var componentString = `\n inst:${guid.Guid.fromCompressedToFull(
          request.body.components.selection[selectionElement].ifc_guid
        )} a bcfOWL:Component ;`;
      }
      if (
        request.body.components.selection[selectionElement].originating_system
      ) {
        componentString += `\n bcfOWL:hasOriginatingSystem  inst:${request.body.components.selection[selectionElement].originating_system} ;`;
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

    sparqlString += `\n bcfOWL:hasSelection ${selectionString.slice(0, -2)} ;`;
  }

  if (request.body.snapshot.snapshot_type) {
    sparqlString += `\n bcfOWL:hasSnapshotType "${request.body.snapshot.snapshot_type}"^^xsd:string ;`;
    //TODO: add bcfOWL:hasSnapshotType... find Ontology for Types?
  }

  if (request.body.components.visibility.exceptions) {
    var exceptionString = "";

    for (exceptionElement in request.body.components.visibility.exceptions) {
      exceptionString += ` inst:${guid.Guid.fromCompressedToFull(
        request.body.components.visibility.exceptions[exceptionElement].ifc_guid
      )}, `;

      // constructing the selection components

      if (
        request.body.components.visibility.exceptions[exceptionElement].ifc_guid
      ) {
        var componentString = `\n inst:${guid.Guid.fromCompressedToFull(
          request.body.components.visibility.exceptions[exceptionElement]
            .ifc_guid
        )} a bcfOWL:Component ;`;
      }
      //   var componentString = `inst:${request.body.components.selection[selectionElement].authoring_tool_id} a bcfOWL:Component ;`;
      // }

      if (
        request.body.components.visibility.exceptions[exceptionElement]
          .originating_system
      ) {
        componentString += `\n bcfOWL:hasOriginatingSystem  inst:${request.body.components.visibility.exceptions[exceptionElement].originating_system} ;`;
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
    sparqlString += `\n bcfOWL:OpeningsVisible ${request.body.components.visibility.view_setup_hints.openings_visible} ;`;
  }

  if (
    request.body.components.visibility.view_setup_hints
      .space_boundaries_visible == true ||
    request.body.components.visibility.view_setup_hints
      .space_boundaries_visible == false
  ) {
    sparqlString += `\n bcfOWL:SpaceBoundariesVisible ${request.body.components.visibility.view_setup_hints.space_boundaries_visible} ;`;
  }

  if (
    request.body.components.visibility.view_setup_hints.spaces_visible ==
      true ||
    request.body.components.visibility.view_setup_hints.spaces_visible == false
  ) {
    sparqlString += `\n bcfOWL:SpacesVisible ${request.body.components.visibility.view_setup_hints.spaces_visible} ;`;
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
};
