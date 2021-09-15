const fetch = require("node-fetch");

exports.sparql_query_endpoint = (req, res, next) => {
  console.log(req.body.query);

  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Basic " + fuseki.auth());

  var urlencoded = new URLSearchParams();
  urlencoded.append("query", req.body.query);
  // res.status(200).json("okay");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(
    "https://lbd.arch.rwth-aachen.de:8443/fuseki/bcfOWL-TestData/",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log("error", error);
    });
};
