function auth() {
  var authString = Buffer.from(
    process.env.FUSEKI_NAME + ":" + process.env.FUSEKI_PW
  ).toString("base64");
  return authString;
}

function fileauth() {
  var authString = Buffer.from(
    process.env.FILESERVER_NAME + ":" + process.env.FILESERVER_PW
  ).toString("base64");
  return authString;
}

module.exports = {
  auth,
  fileauth,
};
