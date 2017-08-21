import Config from "../../Config";

const REQUEST = {
  path: Config.eventStreamPath,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Connection: "Keep-Alive"
  }
};

if (Config.port) {
  REQUEST.port = Config.port;
}

module.exports = REQUEST;
