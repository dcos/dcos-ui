#!/usr/bin/env bash


if [ -z "${1}" ] && [ -z "${INSTALLER_URL}" ]
then
  echo -e "Error: Please pass the installer url or" \
    "specify the INSTALLER_URL environment variable"
  exit 1
fi

CLUSTER_CONFIG=/tmp/cluster-config.yaml
CLUSTER_INFO=/tmp/cluster-info.json

# Create cluster config
cat << EOF > ${CLUSTER_CONFIG}
---
launch_config_version: 1
deployment_name: dcos-ui-system-test-$(date +%s)
installer_url: ${1:-$INSTALLER_URL}
platform: aws
provider: onprem
aws_region: us-west-2
os_name: cent-os-7-dcos-prereqs
instance_type: m4.large
dcos_config:
  cluster_name: DC/OS UI System Integration Tests
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

if ! dcos-launch create -c ${CLUSTER_CONFIG} -i ${CLUSTER_INFO} 1>&2
then
  echo "Error: Cluster launch failed."
  exit 1
fi

if ! dcos-launch wait -i ${CLUSTER_INFO} 1>&2
then
  echo "Error: Cluster did not start."
  exit 1
fi

URL="http://$(dcos-launch describe -i ${CLUSTER_INFO} | python -c \
                'import sys, json; \
                 contents = json.load(sys.stdin); \
                 sys.stdout.write(str(contents["masters"][0]["public_ip"]))')"

BACKOFF=1

until $(curl --output /dev/null --silent --head --fail ${URL}); do
  BACKOFF=$[BACKOFF*2];
  sleep $BACKOFF;
done

echo ${URL}

exit 0