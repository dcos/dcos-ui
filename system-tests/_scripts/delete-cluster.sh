#!/usr/bin/env bash

if [ -z "${VARIANT}" ]; then
  echo -e "Error: Please specify the VARIANT environment variable"
  exit 1
fi

CLUSTER_INFO=/tmp/cluster-info-$VARIANT.json

if ! dcos-launch delete -i ${CLUSTER_INFO} 1>&2; then
  echo "Cluster deletion failed."
  exit 1
fi

rm ${CLUSTER_INFO};
exit 0
