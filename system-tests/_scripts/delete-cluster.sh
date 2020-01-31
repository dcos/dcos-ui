#!/usr/bin/env bash

CLUSTER_INFO=/tmp/cluster_info_$VARIANT.json

if ! dcos-launch delete -i ${CLUSTER_INFO} 1>&2; then
  echo "Cluster deletion failed."
  exit 1
fi

rm ${CLUSTER_INFO};
