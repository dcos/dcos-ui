#!/usr/bin/env bash

eval "$(ssh-agent -s)"

ssh-keygen -t rsa -N "" -f ~/.ssh/$TF_VAR_variant
ssh-add ~/.ssh/$TF_VAR_variant

echo "Running terraform init"
for i in {1..3}; do terraform init --upgrade && break; done

echo "Running terraform apply. This may take a while. Expect 15 minutes."
# we try to recover a couple times in case the first try did not work - which currently happens frequently.
for i in {1..3}; do terraform apply -auto-approve && break; done

# print that cluster url
echo http://$(terraform output cluster-address)
