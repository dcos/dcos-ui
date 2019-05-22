#!/bin/bash
set -e

# path of this file
SCRIPT_PATH="$(cd $(dirname "$0")/$(dirname "$(readlink "$0")") && pwd)"

# This script is a temporary solution to run the integration tests in a <= 1.GB
# memory environment and with support for retries per test file. We should
# replace it with a test runner in the future, please see it more as a proof of
# concept

## Configuration
#####################################################################

# Run headed Chrome instead of headless
# Values: anything :)
CYPRESS_HEADED=

# Don't close headed Chrome after spec finishes
# Values: anything :)
CYPRESS_NO_EXIT=

# Suppresses Cypress output on failures
# Values: 0, 1
SUPPRESS_OUTPUT=${SUPPRESS_OUTPUT:-0}

CLEANUP_TESTS=${CLEANUP_TESTS:-0}

PROXY_PORT=${PROXY_PORT:-4200}
PROXY_PID=0

# Number of consecutive test runs
RERUNS=${RERUNS:-100}

# Used for datadog reporting
REPORT=false

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../" && pwd)"
CYPRESS_FOLDER="cypress"
TESTS_FOLDER="tests"

while getopts 'hkn?' flag; do
  case "${flag}" in
  h) CYPRESS_HEADED="true" ;;
  n) CYPRESS_NO_EXIT="true" ;;
  k) NO_BUILD="true" ;;
  ?)
    echo -e "+----------------------------------+"
    echo -e "| DC/OS Integration test re-runner |"
    echo -e "+----------------------------------+\n"
    echo -e "Don't forget running npm run build:assets first!\n\n"
    echo -e "Usage: \n"
    echo -e "\tnpm run test:integration -- [-hnk]\n"
    echo -e "Options:\n"
    printf "  %-17s %-30s \n" "-h" "Run Chrome in Headed mode"
    printf "  %-17s %-30s \n" "-n" "Don't close Chrome after tests are finished"
    printf "  %-17s %-30s \n" "-r <NUM_RETRIES>" "Number of retries, 3 by default"
    printf "  %-17s %-30s \n" "-k" "Don't run the build, just assume something runs on the right port"
    printf "  %-17s %-30s \n" "-?" "Prints this help"
    echo ""
    exit 0
    ;;
  esac
done

source "$SCRIPT_PATH/../utils/test"
source "$SCRIPT_PATH/../utils/tests-functions"

cd "$PROJECT_ROOT"

setup
trap teardown EXIT
# This aborts if no files are found
if [ -z $(find_files_with_debug_directives "$PROJECT_ROOT/$TESTS_FOLDER") ]; then
  echo "No files found to run, aborting"
  exit 0
fi

# Get all files with .only in it
FILES_TO_RUN="$(find_files_with_debug_directives "$PROJECT_ROOT/$TESTS_FOLDER")"

for TEST_FILE in $FILES_TO_RUN; do
  echo "Running $TEST_FILE $RERUNS times"
  for ((n = 1; n <= RERUNS; n++)); do
    echo "Run #$n"
    TEST_FILE_NAME="$(basename "$TEST_FILE")"
    FILE="${TEST_FILE}" OUTPUT_PATH="${PROJECT_ROOT}/${CYPRESS_FOLDER}/${TEST_FILE_NAME}-${n}" executeCypress
    echo "Done #$n"
  done
done
