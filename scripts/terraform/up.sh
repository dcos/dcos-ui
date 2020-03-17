#!/usr/bin/env bash

eval "$(ssh-agent -s)"

ssh-keygen -t rsa -N "" -f ~/.ssh/$TF_VAR_variant
ssh-add ~/.ssh/$TF_VAR_variant

terraform init
terraform apply -auto-approve > ./log
cat log

# something like `cluster-address = dcos-ui-system-tests-1371554912.us-west-2.elb.amazonaws.com`
line=$(grep -o "cluster-address = \S*" ./log | head -n1 | cut -d" " -f3)

CLUSTER_URL=$(echo http://$(echo $line | cut -d" " -f3))
echo $CLUSTER_URL
echo $CLUSTER_URL
echo $CLUSTER_URL
echo $CLUSTER_URL
