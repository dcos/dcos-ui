#!/bin/bash
# Create a python virtual environment
virtualenv .env
source .env/bin/activate

# Install DC/OS CLI in the sandbox so we can setup and teardown our tests
if [ `uname -s` == "Darwin" ]; then
  curl https://downloads.dcos.io/binaries/cli/darwin/x86-64/dcos-1.13/dcos -o .env/bin/dcos
else
  curl https://downloads.dcos.io/binaries/cli/linux/x86-64/dcos-1.13/dcos -o .env/bin/dcos
fi
chmod +x .env/bin/dcos

# Symlink cypress in isolation so we don't need to install it every time
mv "$TMPDIR/bin/cypress" .env/bin/cypress

# Configure DC/OS CLI
DCOS_CLUSTER_SETUP_ACS_TOKEN=${CLUSTER_AUTH_TOKEN} .env/bin/dcos cluster setup ${UPSTREAM_CLUSTER_URL} --insecure
.env/bin/dcos config set core.reporting true
.env/bin/dcos config set core.timeout 5
