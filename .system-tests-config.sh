#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against the development version of the DC/OS UI
#
cat <<EOF
criteria: []
suites:
  - file:.

targets:
EOF

#
# If the user hasn't provided a cluster, provision one through CCM
# Note than when this approach is used, you *must* also specify the CCM
# authentication token as the CCM_AUTH_TOKEN environment variable
#
if [ -z "$1" ]; then

  # Ensure CCM_AUTH_TOKEN is specified
  if [ -z "$CCM_AUTH_TOKEN" ]; then
    echo "Error: Please specify the CCM_AUTH_TOKEN environment variable"
    exit 1
  fi

cat <<EOF
  - name: open
    title: Open Version
    features: []

    type: ccm
    config:
      template: single-master.cloudformation.json

    env:
      PROXIED_CLUSTER_URL: http://127.0.0.1:4201

    scripts:
      proxy: http-server --proxy-secure=false -p 4201 -P \$CLUSTER_URL dist
      auth: ./system-tests/_scripts/auth-open.py

secrets:
  ccm_auth_token: $CCM_AUTH_TOKEN
EOF

# Otherwise, use the static URL from the user argument
else
cat <<EOF
  - name: open
    title: Open Version
    features: []

    type: static
    config:
      url: $1

    env:
      PROXIED_CLUSTER_URL: http://127.0.0.1:4201

    scripts:
      proxy: http-server --proxy-secure=false -p 4201 -P \$CLUSTER_URL dist
      auth: ./system-tests/_scripts/auth-open.py
EOF
fi
