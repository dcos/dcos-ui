import http from "http";
import { EventEmitter } from "events";

const requestTemplate = {
  path: "",
  method: "POST",
  port: 5050,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
};

class MesosOperatorApiClient extends EventEmitter {
  connect(options) {
    console.log(requestTemplate);
    requestTemplate.path = options.path;
    const req = http.request(requestTemplate, function(res) {
      res.setEncoding("utf8");
      res.on("data", chunk => {
        console.log(`BODY: ${chunk}`);
      });
      /* res.on("data", function(chunk) {
        console.log(chunk);
      }); */
    });
    req.on("error", e => {
      console.error(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.end();
  }
}

module.exports = MesosOperatorApiClient;
