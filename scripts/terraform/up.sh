#!/usr/bin/env bash

cd "$(dirname "$0")"
eval "$(ssh-agent -s)"
[ -f ~/.ssh/ui_test ] || ssh-keygen -t rsa -N "" -f ~/.ssh/ui_test
ssh-add ~/.ssh/ui_test

echo "Running terraform init"
for i in {1..3}; do terraform init && break; done

echo "Running terraform apply. This may take a while. Expect 15 minutes."
# we try to recover a couple times in case the first try did not work - which currently happens frequently.
for i in {1..3}; do terraform apply -auto-approve > ./log && break; done

cat log

# something like `cluster-address = dcos-ui-system-tests-1371554912.us-west-2.elb.amazonaws.com`
line=$(grep -o "cluster-address = \S*" ./log | head -n1)

# print that cluster url
echo http://$(echo $line | cut -d" " -f3)
