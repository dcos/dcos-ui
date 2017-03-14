#!/bin/bash
# Create a python virtual environment
virtualenv .env
source .env/bin/activate

# Install DC/OS CLI in the sandbox so we can setup and teardown our tests
if [ `uname -s` == "Darwin" ]; then
  curl https://downloads.dcos.io/binaries/cli/darwin/x86-64/dcos-1.9/dcos -o .env/bin/dcos
else
  curl https://downloads.dcos.io/binaries/cli/linux/x86-64/dcos-1.9/dcos -o .env/bin/dcos
fi
chmod +x .env/bin/dcos

# Configure DC/OS CLI
dcos config set core.dcos_url $CLUSTER_URL
dcos config set core.ssl_verify False
echo dcos_acs_token = \"$CLUSTER_AUTH_TOKEN\" >> ~/.dcos/dcos.toml

# Install cypress if missing
if ! hash cypress 2>/dev/null; then
  npm install -g cypress-cli
fi
