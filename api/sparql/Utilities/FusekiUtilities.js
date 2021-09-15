function auth() {
  var authString = Buffer.from(
    process.env.FUSEKI_NAME + ":" + process.env.FUSEKI_PW
  ).toString("base64");
  return authString;
}

module.exports = {
  auth,
};
