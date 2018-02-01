#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against the current development environment.
#

# Ensure CLUSTER_URL is specified
if [ -z "$CLUSTER_URL" ]; then
  echo "Error: Please specify the CLUSTER_URL environment variable"
  exit 1
fi

cat <<EOF
criteria: []
suites:
  - file:.

targets:
  - name: dev
    title: Development Cluster
    features: []

    type: static
    config:
      url: $CLUSTER_URL

    env:
      PROXIED_CLUSTER_URL: http://127.0.0.1:4200

    scripts:
      auth: ../_scripts/auth-open.py
      proxy: (cd ../..; npm run testing)
      setup: >
        mv ../../webpack.proxy.dev.js ../../webpack.proxy.dev.js.bak;
        echo "module.exports = {'*': '$CLUSTER_URL'};" > ../../webpack.proxy.dev.js
      teardown: >
        mv ../../webpack.proxy.dev.js.bak ../../webpack.proxy.dev.js
EOF
