#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against a newly provisioned DC/OS Open Cluster.
#
cat <<EOF
criteria: []
suites:
  - file:.

targets:
  - name: open
    title: Open Version
    features: []

    type: script

    env:
      PROXIED_CLUSTER_URL: http://127.0.0.1:4201
      INSTALLER_URL: "${INSTALLER_URL}"
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
      PATH: "/usr/local/bin:$PATH"

    scripts:
      create: ../_scripts/launch-cluster.sh
      proxy: npx http-server --proxy-secure=false -sp 4201 -P \$CLUSTER_URL ../../dist
      auth: ../_scripts/auth-open.py
      teardown: ../_scripts/delete-cluster.sh
EOF
