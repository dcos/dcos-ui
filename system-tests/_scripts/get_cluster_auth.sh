#!/usr/bin/env bash

set -e

if [ -z "$CLUSTER_URL" ]; then
  echo "Please pass a 'CLUSTER_URL' environment variable with an URL to a cluster in it"
  exit 1
fi

if [ -z "$(which jq)" ]; then
  echo "This script needs jq to be installed, we will abort the execution"
  echo "Please install jq from https://stedolan.github.io/jq/"
  exit 1
fi

if [ -z "$(which curl)" ]; then
  echo "This script needs curl to be installed, we will abort the execution"
  echo "Please install curl from https://curl.haxx.se/"
  exit 1
fi

#
# From : https://github.com/dcos/dcos/blob/master/test_util/helpers.py#L35
#
# Token valid until 2036 for user albert@bekstil.net
#    {
#        "email": "albert@bekstil.net",
#        "email_verified": true,
#        "iss": "https://dcos.auth0.com/",
#        "sub": "google-oauth2|109964499011108905050",
#        "aud": "3yF5TOSzdlI45Q1xspxzeoGBe9fNxm9m",
#        "exp": 2090884974,
#        "iat": 1460164974
#    }
#

AUTHENTICATION_BODY_DEFAULT="{\"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9UQkVOakZFTWtWQ09VRTRPRVpGTlRNMFJrWXlRa015Tnprd1JrSkVRemRCTWpBM1FqYzVOZyJ9.eyJlbWFpbCI6ImFsYmVydEBiZWtzdGlsLm5ldCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2Rjb3MuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA5OTY0NDk5MDExMTA4OTA1MDUwIiwiYXVkIjoiM3lGNVRPU3pkbEk0NVExeHNweHplb0dCZTlmTnhtOW0iLCJleHAiOjIwOTA4ODQ5NzQsImlhdCI6MTQ2MDE2NDk3NH0.OxcoJJp06L1z2_41_p65FriEGkPzwFB_0pA9ULCvwvzJ8pJXw9hLbmsx-23aY2f-ydwJ7LSibL9i5NbQSR2riJWTcW4N7tLLCCMeFXKEK4hErN2hyxz71Fl765EjQSO5KD1A-HsOPr3ZZPoGTBjE0-EFtmXkSlHb1T2zd0Z8T5Z2-q96WkFoT6PiEdbrDA-e47LKtRmqsddnPZnp0xmMQdTr2MjpVgvqG7TlRvxDcYc-62rkwQXDNSWsW61FcKfQ-TRIZSf2GS9F9esDF4b5tRtrXcBNaorYa9ql0XAWH5W_ct4ylRNl3vwkYKWa4cmPvOqT5Wlj9Tf0af4lNO40PQ\"}"
BODY=${AUTHENTICATION_BODY:-$AUTHENTICATION_BODY_DEFAULT}
CLUSTER_AUTH_TOKEN=$(curl --insecure -X "POST" -H "Content-Type: application/json" --data "$BODY" "$CLUSTER_URL/acs/api/v1/auth/login" | jq -r ".token")

echo "$CLUSTER_AUTH_TOKEN"
