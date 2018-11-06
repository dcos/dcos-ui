#!/usr/bin/env node

const exec = require("child_process").exec;
const fs = require("fs");

function execute(command) {
  return new Promise((resolve, reject) =>
    exec(command, function(error, stdout, stderr) {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    })
  );
}

if (process.argv.length < 4) {
  throw new Error(
    "You need to pass the version and the base branch in as a command line argument"
  );
}
const version = process.argv[2];
const branch = process.argv[3];
const promise = fs.existsSync("../dcos-commons")
  ? Promise.resolve()
  : execute(
      "git clone https://github.com/mesosphere/dcos-commons.git ../dcos-commons"
    );

promise
  .then(log => {
    console.log(log);
    const releasePath = `./${branch}+dcos-ui-${version}.tar.gz`;

    fs.writeFileSync(releasePath, fs.readFileSync("./release.tar.gz"));

    return execute(
      `S3_BUCKET='dcos-ui-universe' S3_DIR_PATH='oss' S3_DIR_NAME='latest' ../dcos-commons/tools/build_package.sh 'dcos-ui' ./ -a "${releasePath}" aws ${version}`
    );
  })
  .then(console.log)
  .catch(console.error);
