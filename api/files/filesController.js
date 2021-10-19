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
