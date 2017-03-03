#!/usr/bin/bash
virtualenv .env

# Install DC/OS CLI in the sandbox so we can teardown our tests
curl https://downloads.dcos.io/binaries/cli/darwin/x86-64/dcos-1.9/dcos -o .env/bin/dcos
chmod +x .env/bin/dcos

# Install cypress
#npm install -g cypress-cli
