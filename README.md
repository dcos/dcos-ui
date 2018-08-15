# DC/OS UI [![Velocity](http://jenkins.mesosphere.com/buildStatus/icon?job=public-dcos-ui-master)](http://jenkins.mesosphere.com/view/DCOS%20UI/job/public-dcos-ui-master/)

The User Interface for The Datacenter Operating System.

The DC/OS UI is used by datacenter operators to administer and manage a datacenter. Developers use DC/OS UI to manage, deploy and debug their applications. The DC/OS UI sits at the top of the [DC/OS stack](https://dcos.io/docs/latest/overview/architecture/) along with the [CLI](github.com/dcos/dcos-cli).

* [Issue tracker](https://jira.dcos.io). Use component `dcos-ui`.
* [Documentation](https://dcos.io/docs/latest/usage/webinterface/)
* [Apache License v2](./LICENSE)

![DC/OS UI](./.github/dcos-ui.gif)

## Usage

You can choose from two ways of developing this repository.
- Locally
- Docker

### Local Development
#### Requirements

Node 8.9.x and NPM 5.6.x (and above) are **required**. We suggest using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) to keep multiple Node versions on your system.

#### DC/OS Installation Instructions:
1. Clone this repo:

  ```sh
  git clone git@github.com:dcos/dcos-ui.git && cd dcos-ui
  ```

2. Install dependencies:

  ```sh
  npm i
  ```

3. Add developer files for config overrides:

  ```sh
  npm run scaffold
  ```
  This will create `webpack/proxy.dev.js` and `src/js/config/Config.dev.ts`. These files aren't tracked by git and provide a place to override proxy and general dcos-ui configuration. Edit `webpack/proxy.dev.js` to point to the cluster address.

4. Start the development server:

  ```sh
  npm start
  ```

5. Navigate to [http://localhost:4200](http://localhost:4200)

*6. (optional, not suggested) Follow the instructions [here](https://github.com/dcos/dcos-vagrant) to install a local cluster.*

### Development with Docker

To start a development server run

```sh
docker-compose up -d
docker-compose exec toolchain /bin/bash # This opens bash inside of the docker container
npm start
```

### Using External Plugins

DC/OS UI comes bundled with some internal plugins within the `/plugins` directory. You can also load more plugins from another directory and they will be loaded into DC/OS UI along with the internal plugins. To set a directory for external plugins run:
```sh
npm config set externalplugins ../relative/path/to/plugins/directory
```

## Contributing

[Contributing Guidelines](./CONTRIBUTING.md)

### Testing

See more at the [Testing](./CONTRIBUTING.md#testing) section of the Contribution Guidelines.

## License and Author

Copyright Mesosphere, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this repository except in compliance with the License.

The contents of this repository are solely licensed under the terms described in the [LICENSE file](./LICENSE) included in this repository.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Authors are listed in [Authors.md file](./Authors.md).
