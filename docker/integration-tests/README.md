## Running DC/OS UI integration tests in Docker

These instructions will guide you through building and launching the integration tests for DC/OS UI using docker.

### Requirements
1. [Install docker](https://www.docker.com/products/overview)
2. Clone dcos-ui repo

  ```sh
  git clone git@github.com:dcos/dcos-ui.git && cd dcos-ui
  ```

### Build Step

You'll only need to run the build once. If you change the path to your plugins repo, you'll need to build again.

1. Start docker on your machine
2. Build the dcos-ui docker image. Run this command inside the the cloned `dcos-ui` repo.

  **Option 1**. Build without a plugins repo
    ```sh
    docker build \
      -t dcos-ui-integration:latest \
      -f docker/integration-tests/Dockerfile.integration .
    ```

  **Option 2**. Build with a plugins repo

    If you have a repository of plugins to enhance DC/OS UI, you may configure this by passing a URL to the git repo. For example: `https://{AUTH_TOKEN}:x-oauth-basic@github.com/my-company/dcos-ui-plugins.git`, where `{AUTH_TOKEN}` would be your generated token from, e.g. https://github.com/settings/tokens.

    ```sh
    docker build \
      --build-arg PLUGINS_REPO="" \
      -t dcos-ui-integration:latest \
      -f docker/integration-tests/Dockerfile.integration .
    ```


### Run step

**Pre-requisite:** You must have an already running DC/OS cluster.

1. Start docker on your machine

2. Set cluster URL. The address of a DC/OS cluster to be used as the backend. The cluster version must be compatible with the UI assets.

  ```sh
  export CLUSTER_ADDRESS=https://a-dcos-cluster.us-west-2.elb.amazonaws.com
  ```

3. Run the dcos-ui docker image

  **Option 1**. Run without a plugins repo
  ```sh
  docker run --ipc=host \
    -p 127.0.0.1:4200:4200 \
    -e "CLUSTER_ADDRESS=$CLUSTER_ADDRESS" \
    -e "APPLICATION_CHECKOUT=master" \
    -it dcos-ui-integration
  ```

  **Option 2**. Run using a plugins repo
  ```sh
  docker run --ipc=host \
    -p 127.0.0.1:4200:4200 \
    -e "CLUSTER_ADDRESS=$CLUSTER_ADDRESS" \
    -e "APPLICATION_CHECKOUT=master" \
    -e "PLUGINS_CHECKOUT=master" \
    -it dcos-ui-integration
  ```
  You may configure the following set of environment variables.
  * `APPLICATION_CHECKOUT` – This can be a branch or hash that will be used in `git checkout` for the `dcos-ui` repo.
  * `PLUGINS_CHECKOUT` – This can be a branch or hash that will be used in `git checkout` for the plugins repo (if configured).

  It'll take a few minutes for the DC/OS UI application to come up. Once the application is built and running, the tests will begin running.

You may run step #2, #3 over and over with different configurations. If you wish to use a different plugins repo you will have to build the docker machine again.
