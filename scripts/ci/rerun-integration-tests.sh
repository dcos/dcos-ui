#!/bin/bash
set -e

# configurable by environment variable
RERUNS=${RERUNS:-100}

# path of this file
SCRIPT_PATH="$(cd $(dirname "$0")/$(dirname "$(readlink "$0")") && pwd)"

# project root for this file
PROJECT_ROOT="$( cd "$( echo "${SCRIPT_PATH}" | sed s+/scripts/ci++)" && pwd )"

source "$SCRIPT_PATH/../utils/test"
source "$SCRIPT_PATH/../utils/integration-tests"

# This aborts if no files are found
if [ -z $(find_files_with_debug_directives "$PROJECT_ROOT/$TESTS_FOLDER") ]; then
  echo "No files found to run, aborting"
  exit 0
fi

# Get all files with .only in it
FILES_TO_RUN="$(find_files_with_debug_directives "$PROJECT_ROOT/$TESTS_FOLDER")"

setup
trap teardown EXIT

for TEST_FILE in $FILES_TO_RUN;
do
  echo "Running $TEST_FILE $RERUNS times"
  for ((n=1;n<=RERUNS;n++));
  do
    echo "Run #$n"
    TEST_FILE_NAME="$(basename "$TEST_FILE")"
    FILE="${TEST_FILE}" OUTPUT_PATH="${PROJECT_ROOT}/${CYPRESS_FOLDER}/${TEST_FILE_NAME}-${n}" executeCypress
    echo "Done #$n"
  done
done