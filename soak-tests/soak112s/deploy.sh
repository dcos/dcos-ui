#!/bin/sh

set -ex
cd "${0%/*}" # to the folder containing this script.

IMAGE_IDENTIFIER='mesosphere/dcos-ui-soak:112s'

# Build and publish docker image
docker build -t $IMAGE_IDENTIFIER .
docker push $IMAGE_IDENTIFIER
