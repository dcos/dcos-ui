var fs = require("fs");

// Make sure we have a Config.dev so we don't error on Config loading
var configFilePath = "./src/js/config/Config.dev.ts";
if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(
    configFilePath,
    fs.readFileSync("./src/js/config/Config.template.ts", "utf8"),
    "utf8"
  );
}

// Create a proxy.dev to make getting started easier
var proxyFilePath = "./webpack/proxy.dev.js";
if (!fs.existsSync(proxyFilePath)) {
  fs.writeFileSync(
    proxyFilePath,
    fs.readFileSync("./webpack/proxy.template.js", "utf8"),
    "utf8"
  );
}
