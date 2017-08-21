import http from "http";
import Rx from "rxjs/Rx";
import requestTemplate from "./constants/MesosOperatorRequest";

const stream = new Rx.ReplaySubject();
let cache = "";
let messageLength = 0;

const readMessageAndResetHead = function() {
  const event = JSON.parse(cache.substring(0, messageLength));
  cache = cache.substring(messageLength, cache.length);
  messageLength = 0;
  console.log(event);
  stream.next(event);
};

const getNextMessageLength = function() {
  let messageLengthPosition = cache.indexOf("\n");
  if (messageLengthPosition === -1) {
    messageLengthPosition = cache.indexOf("\r\n");
  }
  if (messageLengthPosition !== -1) {
    messageLength = parseInt(cache.substring(0, messageLengthPosition), 10);
    cache = cache.substring(messageLengthPosition + 1, cache.length);
  }
};

const parseResponse = function(chunk) {
  cache += chunk.toString();
  if (messageLength === 0) {
    getNextMessageLength();
  }
  if (messageLength > 0 && cache.length >= messageLength) {
    readMessageAndResetHead();
  }
};
const connect = function() {
  const req = http.request(requestTemplate, res => {
    res.setEncoding("utf8");

    cache = "";
    messageLength = 0;

    res.on("data", chunk => {
      parseResponse(chunk);
    });
  });
  req.on("error", e => {
    console.error(`problem with request:`, e);
  });
  req.write(
    JSON.stringify({
      type: "SUBSCRIBE"
    })
  );
  req.end();
};
connect();

module.exports = { stream };
