// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_KEY);
//     req.userData = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "Authentication failed",
//     });
//   }
// };

var { createSolidTokenVerifier } = require('@solid/access-token-verifier')
var { SolidNodeClient } = require('solid-node-client')
var solidOidcAccessTokenVerifier = createSolidTokenVerifier()

module.exports = (req, res, next) {
  const authorizationHeader = req.headers.authorization
  const dpopHeader = req.headers.dpop
  const method = req.method
  var url = req.protocol + '://' + req.get('host') + req.originalUrl;

  try {
     const { client_id: clientId, webid: webId } = await solidOidcAccessTokenVerifier(
        authorizationHeader,
        {
           header: dpopHeader,
           method,
           url
        }
     );
        req.auth = {}
     req.auth.webId = webId
     req.auth.clientId = clientId
     next()
  } catch (error) {
     const message = `Error verifying Access Token via WebID: ${error}}`;
     req.auth = {}
     req.auth.webId = undefined
     req.auth.clientId = undefined
     next()
  }
}