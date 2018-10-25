#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against a given DC/OS Open Cluster.
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
  - name: open
    title: Open Version
    features: []

    type: static
    config:
      url: $CLUSTER_URL

    env:
      PATH: "/usr/local/bin:$PATH"
      CLI_VERSION: "${CLI_VERSION}"

    scripts:
      auth: ../_scripts/auth-open.py
EOF
