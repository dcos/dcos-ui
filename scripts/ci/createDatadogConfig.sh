#!/bin/bash

set -e

cat << EOF > .dogapirc
{
  "api_key": "$DATADOG_API_KEY",
  "app_key": "$DATADOG_APP_KEY"
}
EOF