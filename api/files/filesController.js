const fetch = require("node-fetch");
const fuseki = require("../Utilities/FusekiUtilities");

exports.get_file = (req, res, next) => {
  const projectId = req.params.projectId;
  const ressource = req.params.ressource;

  var fileHeader = new fetch.Headers();
  fileHeader.append("Authorization", "Basic " + fuseki.fileauth());

  var requestOptions = {
    method: "GET",
    headers: fileHeader,
    redirect: "follow",
  };

  fetch(
    process.env.FILESERVER_URL + `${projectId}/${ressource}`,
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
};

exports.post_file = (req, res, next) => {
  const projectId = req.params.projectId;
  const fileName = req.params.ressource;

  var data = new Buffer.from("");

  req.on("data", function (chunk) {
    data = Buffer.concat([data, chunk]);
  });
  req.on("end", function () {
    const filename = fileName;

    const fileType = filename.split(".")[1];

    var formdata = new FormData();
    formdata.append("fileStream", data, `${filename}`);

    var fileHeader = new fetch.Headers();
    fileHeader.append("Authorization", "Basic " + fuseki.fileauth());

    const fileUrl = process.env.FILESERVER_URL + `${projectId}/${filename}`;

    var requestOptions = {
      method: "POST",
      headers: fileHeader,
      body: formdata,
      redirect: "follow",
    };
    fetch(fileUrl, requestOptions)
      .then((response) => response)
      .then((result) => {
        res.status(201).json("okay");
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  });
};
