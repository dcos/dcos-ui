#!/bin/bash
# Create a python virtual environment
SCRIPT=`realpath $0`
SCRIPT_PATH=`dirname $SCRIPT`
CYPRESS=`realpath "${SCRIPT_PATH}/../../node_modules/cypress/bin/cypress"`

ln -s $CYPRESS "$TMPDIR/cypress"