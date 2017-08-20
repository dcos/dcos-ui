import http from "http";
import { EventEmitter } from "events";

const requestTemplate = {
  path: "",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
};

class MesosOperatorApiClient extends EventEmitter {
  connect(options) {
    requestTemplate.path = options.path;
    const req = http.request(requestTemplate, function(res) {
      res.setEncoding("utf8");
      res.on("data", chunk => {
        console.log(chunk);
      });
    });
    req.on("error", e => {
      console.error(`problem with request: ${e.message}`);
    });
    req.write(
      JSON.stringify({
        type: "SUBSCRIBE"
      })
    );
    req.end();
  }
}

module.exports = MesosOperatorApiClient;
