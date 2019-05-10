var checker = require("license-checker");
var fs = require("fs");
var packageJSON = require("../package.json");

function buildDependenciesArray(dependencies) {
  return Object.keys(dependencies).map(function(dependency) {
    var version = dependencies[dependency];

    if (version.startsWith("github:")) {
      var json = JSON.parse(
        fs.readFileSync(
          "./node_modules/" + dependency + "/package.json",
          "utf8"
        )
      );
      version = json.version;
    }

    return dependency + "@" + version;
  });
}

var dependencies = buildDependenciesArray(packageJSON.dependencies);
dependencies = dependencies.concat(
  buildDependenciesArray(packageJSON.devDependencies)
);

checker.init(
  {
    start: "./"
  },
  function(json, error) {
    if (error) {
      console.log(error);
      process.exit(1);
    }

    var count = 0;
    var found = [];
    Object.keys(json).forEach(function(dependency) {
      if (dependencies.indexOf(dependency) === -1) {
        return;
      }

      count++;
      found.push(dependency);

      var licenses = json[dependency].licenses;
      if (licenses === "UNKNOWN") {
        console.warn("Dependency has an unknown license", json[dependency]);
      }

      if (licenses.indexOf("LGPL") === -1 && licenses.match(/GPL/gi)) {
        console.log("Package has invalid license.", json[dependency]);
        process.exit(1);
      }
    });

    // Ensure we found them all
    if (count !== dependencies.length) {
      console.log("Dependency length doesn't match.");
      var missing = dependencies.filter(function(dependency) {
        return found.indexOf(dependency) === -1;
      });
      console.log(missing);
      process.exit(1);
    }
  }
);
