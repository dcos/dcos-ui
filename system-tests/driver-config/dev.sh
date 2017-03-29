#!/bin/bash
#
# This is a configuration script to the system-test-driver that runs the
# integration tests against the current development environment.
#

cat <<EOF
criteria: []
suites:
  - file:.

targets:
  - name: dev
    title: NPM-Served Cluster (Open)
    features: []

    type: static
    config:
      url: http://127.0.0.1:4200

    scripts:
      auth: ../_scripts/auth-open.py
EOF
