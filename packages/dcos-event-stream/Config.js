var Config = {
  eventStreamPath: "/mesos/api/v1"
};

if (process && process.env && process.env.NODE_ENV) {
  Config.environment = process.env.NODE_ENV;
}

if (Config.environment === "development") {
  Config.port = 3000;
}

module.exports = Config;
