#!/usr/bin/env bats
SCRIPT_PATH="$(dirname "$0")/$(dirname "$(readlink "$0")")"

@test "validate-engine-versions: matching node and npm version" {
  local pwd=$(pwd)
  cd $(mktemp -d)
  run $SCRIPT_PATH/validate-engine-versions
  [ "$status" -eq 0 ]
  cd pwd
}

