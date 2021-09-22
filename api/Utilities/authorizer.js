const fetch = require("node-fetch");

function authorizer(username, password, cb) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    id: username,
    password: password,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("test");

  fetch("http://localhost:3000/bcf/3.0/auth/login", requestOptions)
    .then((response) => response)
    .then((result) => {
      if (result.status == 200) {
        return cb(null, true);
      } else {
        return cb(null, false);
      }
    })
    .catch((error) => console.log("error", error));
}

module.exports = {
  authorizer,
};
