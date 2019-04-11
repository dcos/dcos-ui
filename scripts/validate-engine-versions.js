#!/usr/bin/env node

const semver = require("semver");
const packageJson = require("../package.json");

// "npm_config_user_agent": "npm/6.8.0 node/v10.9.0 darwin x64",
const npmVersion = process.env.npm_config_user_agent.match(
  /npm\/(\d{1,}\.\d{1,}\.\d{1,})/
);

if (!semver.satisfies(npmVersion[1], packageJson.engines.npm)) {
  console.error(
    `WARNING! given npm version (${
      npmVersion[1]
    }) doesnt satisfy requested range (${packageJson.engines.npm}).`
  );
  process.exit(1);
}
