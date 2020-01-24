# DC/OS UI Private Plugins

## Installing the nightly version on your cluster

As we ship the UI as a package you can install a nighly version on your cluster
using this command:

```sh
dcos package repo remove dcos-ui-aws
dcos package repo add --index=0 dcos-ui-aws 'https://universe-converter.mesosphere.com/transform?url=https://dcos-ui-universe.s3.amazonaws.com/ee/dcos-ui/latest/stub-universe-dcos-ui.json'
```

This allows you to see the newest version of DC/OS UI in the Catalog.
