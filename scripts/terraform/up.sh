#!/usr/bin/env bash

export TF_INPUT=false
export TF_IN_AUTOMATION=1

eval "$(ssh-agent -s)"

ssh-keygen -t rsa -N "" -f ~/.ssh/$TF_VAR_variant
ssh-add ~/.ssh/$TF_VAR_variant

echo "Running terraform init"
for i in {1..3}; do terraform init >&2 && break; done

echo "Running terraform apply. This may take a while. Expect 15 minutes."
# we try to recover a couple times in case the first try did not work - which currently happens frequently.
for i in {1..3}; do terraform apply -auto-approve >&2 && break; done

echo http://$(terraform output cluster-address)
