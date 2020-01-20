#!/usr/bin/env python
import json
import os
import base64
import requests

requests.packages.urllib3.disable_warnings()

# Use password authentication
credentials = {
  "uid": "bootstrapuser",
  "password" : "deleteme"
}

# Try to login
response = requests.post('%s/acs/api/v1/auth/login' % os.environ['CLUSTER_URL'], json=credentials, verify=False)

# Echo results
print(json.dumps({
  'token': response.json()['token'],
  'profile': {
    'uid': 'bootstrapuser',
    'description': 'Bootstrap superuser'
  }
}))
