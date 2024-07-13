import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import { Express } from "express";

// const sslOptions = {
//   key: fs.readFileSync(""),
//   cert: fs.readFileSync(""),
// };

const HTTP = (App: Express) => {
  return http.createServer(App);
};

const HTTPS = (App: Express) => {
  //   return https.createServer(sslOptions, App);
};

export default { HTTP, HTTPS };
