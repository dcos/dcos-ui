const fs = require("fs");

// Make sure we have a Config.dev so we don't error on Config loading
const configFilePath = "./src/js/config/Config.dev.ts";
if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(
    configFilePath,
    fs.readFileSync("./src/js/config/Config.ee.template.js", "utf8"),
    "utf8"
  );
}
