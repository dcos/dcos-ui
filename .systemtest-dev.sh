#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against the development version of the DC/OS UI
#

# Require a cluster to be specified from the command-line
CLUSTER_URL="$1"
CLUSTER_AUTH_SCRIPT="$2"
LOCAL_PORT=8050

# Validate
if [ -z "$CLUSTER_URL" ]; then
  echo "Please specify the cluster URL to use"
  exit 1
fi

# Start an http proxy that will serve the built version of the DC/OS UI
# against the cluster specified.
cat <<EOF
{
  "criteria": [],

  "suites": [
    "file:."
  ],

  "scripts": {
    "daemon": "http-server -p $LOCAL_PORT -P $CLUSTER_URL dist"
  },

  "targets": [
    {
      "name": "open",
      "title": "Open Version",
      "features": [],
      "type": "static",
      "config": {
        "url": "http://127.0.0.1:$LOCAL_PORT"
      },
      "scripts": {
        "auth": "./system-tests/_scripts/auth-open.py"
      }
    }
  ]
}
EOF
