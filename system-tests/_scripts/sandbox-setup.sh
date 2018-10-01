#!/bin/bash
# Create a python virtual environment
SCRIPT=`realpath $0`
SCRIPT_PATH=`dirname $SCRIPT`
CYPRESS=`realpath "${SCRIPT_PATH}/../../node_modules/cypress/bin/cypress"`

cp -R "/root/.cache" "$TMPDIR/../"
mkdir "$TMPDIR/bin"
ln -s $CYPRESS "$TMPDIR/bin/cypress"