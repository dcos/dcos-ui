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

### Setting Up a Development Environment

```sh
git clone git@github.com:dcos/dcos-ui.git && cd dcos-ui
npm i

# Add developer files for config overrides. E.g. to enable plugins.
npm run util:scaffold

# start the development server against an existing cluster
CLUSTER_URL=<MY-CLUSTER> npm start
```

### Using Docker

If you prefer to use docker, you might want to try docker-compose:

```sh
docker-compose up -d
docker-compose exec toolchain /bin/bash # This opens bash inside of the docker container
CLUSTER=URL=<MY-CLUSTEr> npm start
```

## Releasing

To create a bump PR against DCOS, you can run `./script/ci/dcos-bump`.
You'll need some credentials that you can get from the `ux-guild`.
Once the bump-PR is up, please ensure that all addressed issues are mentioned in
the PRs description. Afterwards comment on the PR:
`@mesosphere-mergebot backport 2.1 2.0 1.13`. Please have a look at all
`Changes.md`s and update those if needed. Get those PRs merged, done!

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
