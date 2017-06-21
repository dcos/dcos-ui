var checker = require("license-checker");
var connect = require("gulp-connect");
var fs = require("fs");
var gulp = require("gulp");
var packageJSON = require("./package.json");
var shrinkwrap = require("./npm-shrinkwrap.json");

gulp.task("ensureConfig", function() {
  // Make sure we have a Config.dev so we don't error on Config loading
  var configFilePath = "./src/js/config/Config.dev.js";
  if (!fs.existsSync(configFilePath)) {
    var template = fs.readFileSync(
      "./src/js/config/Config.template.js",
      "utf8"
    );
    fs.writeFileSync(configFilePath, template, "utf8");
  }
});

gulp.task("ensureDevProxy", function() {
  // Create a proxy.dev to make getting started easier
  var proxyFilePath = "./webpack/proxy.dev.js";
  if (!fs.existsSync(proxyFilePath)) {
    var template = fs.readFileSync("./webpack/proxy.template.js", "utf8");
    fs.writeFileSync(proxyFilePath, template, "utf8");
  }
});

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

gulp.task("checkDependencies", function() {
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
});

gulp.task("serve", function() {
  connect.server({
    port: 4200,
    root: "./dist"
  });
});

// remove 'fsevents' from shrinkwrap, since it causes errors on non-Mac hosts
// see https://github.com/npm/npm/issues/2679
gulp.task("fixShrinkwrap", function(done) {
  delete shrinkwrap.dependencies.fsevents;
  var shrinkwrapString = JSON.stringify(shrinkwrap, null, "  ") + "\n";
  fs.writeFile("./npm-shrinkwrap.json", shrinkwrapString, done);
});
