global._root = __dirname;

const database = require("./server/database.js");
const middleware = require("./server/middleware.js");
const routes = require("./server/routes.js");
const server = require("./server/server.js");
const express = require("express");
const app = express();

database.assert(["users"], (err) => {
  if (err)
    return console.error(Error(err));

  middleware(app);
  routes(app);
  server(app);
});