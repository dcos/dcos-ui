#!/usr/bin/env bash

cd "$(dirname "$0")"

export TF_VAR_cluster_name="ui-$STAGE_ID-$(date +%s |  tail -c 5)"
echo TF_VAR_cluster_name $TF_VAR_cluster_name
echo STAGE_ID $STAGE_ID
echo $TF_VAR_cluster_name > /tmp/cluster_name-$STAGE_ID
rsync -aH ../terraform/ ../terraform-$STAGE_ID/
echo "rsynced"
export CLUSTER_URL=$(cd ../terraform-$STAGE_ID && ./up.sh)
echo "upped"
echo CLUSTER_URL $CLUSTER_URL
. ../utils/load_auth_env_vars

DCOS_CLUSTER_SETUP_ACS_TOKEN="$CLUSTER_AUTH_TOKEN" dcos cluster setup "$CLUSTER_URL" --provider=$DCOS_AUTH_PROVIDER --insecure
cd ../../ && npm run test:system
