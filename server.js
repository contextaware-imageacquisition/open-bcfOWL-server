const http = require("http");
const app = require("./app");

const port = process.env.PORT || 3000;

console.log(port);

const server = http.createServer(app);

// Init Server
server.listen(port);
