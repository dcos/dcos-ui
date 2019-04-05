#!/bin/bash

BACKOFF=1
until $(curl --output /dev/null --silent --head --fail ${CLUSTER_URL}); do
  BACKOFF=$((BACKOFF * 2))
  sleep $BACKOFF
done
