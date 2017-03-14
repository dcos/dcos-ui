#!/usr/bin/bash
virtualenv .env

# Install DC/OS CLI in the sandbox so we can setup and teardown our tests
curl https://downloads.dcos.io/binaries/cli/darwin/x86-64/dcos-1.9/dcos -o .env/bin/dcos
chmod +x .env/bin/dcos

# Configure DC/OS CLI
dcos config set core.dcos_url $CLUSTER_URL
dcos config set core.ssl_verify False
echo dcos_acs_token = \"$CLUSTER_AUTH_TOKEN\" >> ~/.dcos/dcos.toml

# Install cypress
#npm install -g cypress-cli

