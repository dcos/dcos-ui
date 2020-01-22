#!/usr/bin/env bash

CLUSTER_INFO=/tmp/cluster-info-ee.json

if ! dcos-launch delete -i ${CLUSTER_INFO}; then
  echo "Cluster deletion failed."
  exit 1
fi

rm ${CLUSTER_INFO};
exit 0
