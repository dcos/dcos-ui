#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against a newly provisioned DC/OS Open Cluster.
#

# Ensure CCM_AUTH_TOKEN is specified
if [ -z "$CCM_AUTH_TOKEN" ]; then
  echo "Error: Please specify the CCM_AUTH_TOKEN environment variable"
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

    type: ccm
    config:
      template: single-master.cloudformation.json

    env:
      PROXIED_CLUSTER_URL: http://127.0.0.1:4201
      PATH: "/usr/local/bin:$PATH"

    scripts:
      proxy: http-server --proxy-secure=false -p 4201 -P \$CLUSTER_URL ../../dist
      auth: ../_scripts/auth-open.py

secrets:
  ccm_auth_token: $CCM_AUTH_TOKEN
EOF
