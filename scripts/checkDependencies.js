const checker = require("license-checker");
const fs = require("fs");
const { dependencies, devDependencies } = require("../package.json");

const pkgVersion = name =>
  JSON.parse(fs.readFileSync(`./node_modules/${name}/package.json`, "utf8"))
    .version;

// strings like these: `[ "jest@22.0.0", "react@42.0.0" ]`
const deps = Object.entries({ ...dependencies, ...devDependencies }).map(
  ([name, v]) => `${name}@${!v.startsWith("github:") ? v : pkgVersion(name)}`
);

checker.init({ start: "./" }, (error, json) => {
  if (error) {
    console.log(error);
    process.exit(1);
  }

  const checkedDependencies = Object.entries(json)
    .filter(([dependency]) => deps.includes(dependency))
    .map(([dependency, pkg]) => {
      if (pkg.licenses === "UNKNOWN") {
        console.warn("Dependency has an unknown license", pkg);
      }

      if (pkg.licenses.match(/GPL/gi) && !pkg.licenses.includes("LGPL")) {
        console.log("Package has invalid license.", pkg);
        process.exit(1);
      }

      return dependency;
    });

  // Ensure we found them all
  if (checkedDependencies.length !== deps.length) {
    console.log(`Could not check licenses of these packages:`);
    console.log(deps.filter(d => !checkedDependencies.includes(d)));
    console.log(
      "'npm install' should fix this issue, unless you installed a package with a license we do not want to use."
    );

    process.exit(1);
  }
});
