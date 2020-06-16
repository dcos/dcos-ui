#!/bin/bash

# This generates a new release on github and afterwards creates bumps on dcos.
# This is the fastest way to get changes into dcos as you don't wait for our master's CI to create that github-release.

set -e

if [ -z "$GH_USER" ] || [ -z "$GH_TOKEN" ] || [ -z "$JIRA_USER" ] || [ -z "$JIRA_PASS" ]; then
  echo "I need GH_USER, GH_TOKEN, JIRA_USER, and JIRA_PASS to be set."
  exit 1
fi

npm install
npm run build
npx semantic-release --no-ci
./scripts/ci/dcos-bump
