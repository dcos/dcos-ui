#!/bin/bash
# Create a python virtual environment
virtualenv .env
source .env/bin/activate

# Install DC/OS CLI in the sandbox so we can setup and teardown our tests
if [ `uname -s` == "Darwin" ]; then
  curl https://downloads.dcos.io/binaries/cli/darwin/x86-64/dcos-1.10/dcos -o .env/bin/dcos
else
  curl https://downloads.dcos.io/binaries/cli/linux/x86-64/dcos-1.10/dcos -o .env/bin/dcos
fi
chmod +x .env/bin/dcos

# Symlink cypress in isolation so we don't need to install it every time
mv "$TMPDIR/cypress" .env/bin/cypress
# /dcos-ui/jenkins/workspace/Frontend/dcos-ui-pull-requests-system-tests/node_modules/cypress/bin/cypress

# Configure DC/OS CLI
CONFIG_DIR=~/.dcos
CONFIG_FILE=${CONFIG_DIR}/dcos.toml
mkdir -p ${CONFIG_DIR}
cat << EOF > ${CONFIG_FILE}
  [core]
  ssl_verify = false
  reporting = true
  timeout = 5
  dcos_url = "${CLUSTER_URL}"
  dcos_acs_token = "${CLUSTER_AUTH_TOKEN}"
EOF
chmod 600 ${CONFIG_FILE}
