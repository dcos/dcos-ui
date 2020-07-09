# DC/OS UI [![Build Status](https://jenkins.mesosphere.com/service/jenkins/buildStatus/icon?job=frontend/dcos-ui-oss-pipeline/master)](https://jenkins.mesosphere.com/service/jenkins/job/frontend/job/dcos-ui-oss-pipeline/job/master/)

The User Interface for The Datacenter Operating System.

The DC/OS UI is used by datacenter operators to administer and manage a
datacenter. Developers use DC/OS UI to manage, deploy and debug their
applications. The DC/OS UI sits at the top of the [DC/OS
stack](https://docs.d2iq.com/mesosphere/dcos/latest/overview/architecture/)
along with the [CLI](https://github.com/dcos/dcos-cli).

- [Issue tracker](https://jira.d2iq.com). Use label `ux-guild`.
- [Documentation](https://docs.d2iq.com/mesosphere/dcos/latest/gui/)
- [Apache License v2](./LICENSE)

![DC/OS UI](./.github/dcos-ui.gif)

## Usage

You can choose from two ways of developing this repository.

- Locally
- Docker

### Local Development

```sh
git clone git@github.com:dcos/dcos-ui.git && cd dcos-ui
npm i

# Add developer files for config overrides. E.g. to enable plugins.
npm run util:scaffold

# Now edit `webpack/proxy.dev.js` to point to a cluster.

# start the development server
npm start

# open http://localhost:4200
```

### Development with Docker

To start a development server run

```sh
docker-compose up -d
docker-compose exec toolchain /bin/bash # This opens bash inside of the docker container
npm start
```

## Installing the nightly version on your cluster

As we ship the UI as a package you can install a nighly version on your cluster
using this command:

```sh
dcos package repo remove dcos-ui-aws
dcos package repo add --index=0 dcos-ui-aws 'https://universe-converter.mesosphere.com/transform?url=https://dcos-ui-universe.s3.amazonaws.com/oss/dcos-ui/latest/stub-universe-dcos-ui.json'
```

This allows you to see the newest version of DC/OS UI in the Catalog.

## Contributing

[Contributing Guidelines](./CONTRIBUTING.md)

### Testing

See more at the [Testing](./CONTRIBUTING.md#testing) section of the Contribution Guidelines.

## License and Author

Copyright D2iQ, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this repository except in compliance with the License.

The contents of this repository are solely licensed under the terms described in the [LICENSE file](./LICENSE) included in this repository.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Authors are listed in [Authors.md file](./Authors.md).
