#!/usr/bin/env bash

set -e

if [ -z "${INSTALLER_URL}" ]; then
  echo -e "Error: Please specify the INSTALLER_URL environment variable"
  exit 1
fi

if [ -z "${VARIANT}" ]; then
  echo -e "Error: Please specify the VARIANT environment variable"
  exit 1
fi

CLUSTER_CONFIG=/tmp/cluster-config-$VARIANT.yaml
CLUSTER_INFO=/tmp/cluster-info-$VARIANT.json
CLUSTER_URL_FILE=/tmp/cluster_url-$VARIANT.txt

rm ${CLUSTER_INFO} || echo "No file to delete"

LICENSE=""

if [[ ! -z "$LICENSE_KEY" ]]; then
  LICENSE="license_key_contents: ${LICENSE_KEY}"
fi

# Create cluster config
cat <<EOF >${CLUSTER_CONFIG}
---
launch_config_version: 1
deployment_name: dcos-ui-system-test-$VARIANT-$(date +%s)
installer_url: ${1:-$INSTALLER_URL}
platform: aws
provider: onprem
aws_region: us-west-2
os_name: cent-os-7-dcos-prereqs
instance_type: m4.large
dcos_config:
  cluster_name: DC/OS UI System Integration Tests
  ${LICENSE}
  resolvers:
    - 8.8.4.4
    - 8.8.8.8
  dns_search: mesos
  master_discovery: static
  exhibitor_storage_backend: static
num_masters: 1
num_private_agents: 1
num_public_agents: 1
ssh_user: centos
key_helper: true
EOF

if ! dcos-launch create -c ${CLUSTER_CONFIG} -i ${CLUSTER_INFO} 1>&2; then
  echo "Error: Cluster launch failed."
  exit 1
fi

if ! dcos-launch wait -i ${CLUSTER_INFO} 1>&2; then
  echo "Error: Cluster did not start."
  exit 1
fi

LAUNCH_DESCRIBE=$(dcos-launch describe -i ${CLUSTER_INFO})
echo $LAUNCH_DESCRIBE
URL=$(echo $LAUNCH_DESCRIBE | jq -r .masters[0].public_ip)
echo $URL
URL="http://$URL"

# Wait for Admin Router to be up
until $(curl --output /dev/null --silent --head --fail ${URL}); do
  sleep 2
done

export CLUSTER_URL=${URL}

if [ -f $CLUSTER_URL_FILE ]; then
  echo "Removing $CLUSTER_URL_FILE"
  rm $CLUSTER_URL_FILE
fi
echo "Saving cluster url to $CLUSTER_URL_FILE"
echo "$CLUSTER_URL" >$CLUSTER_URL_FILE
