# Testing

**Why is testing important?** Many of us like to sleep at night. So to give us peace of mind when we release a new version of our software, we want to guarantee that the application works as it should, always. To accomplish this we write two kinds of tests that will ensure that our applications behaves as it should even as we add new features.

## Unit Tests

These tests ensure that individual units of code (functions/methods) return the expected results with different inputs.
Think of a `sum` function. When called as `sum(1)` we may expect a return value of `1`. When called as `sum(1, 2)` we may expect a return value of `3`. And when called with no arguments, we may expect an error to be thrown.

### Running Unit Tests

Make sure your packages are up to date by running `npm install`, and then run tests with:

```sh
npm test
```

## Integration Tests

We want to guarantee that our project DC/OS UI works as it should within DC/OS as a product. To do this we want our integration tests to run against a DC/OS cluster. For example we want to test that when an slave fails in a cluster, the UI visually shows this slave failure. A different example is validating that when a new service is installed on a cluster it will show up in the services page.

### Integration Tests Setup

1. Install Cypress CLI

  ```sh
  npm install -g cypress-cli
  ```

2. Install Cypress desktop app

  ```sh
  cypress install
  ```

3. Open Cypress

  ```sh
  cypress open
  ```

  This should show a new icon on your desktop menu bar.

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-desktop-icon.png?raw=true)

4. Login with Github. Click on the icon on your desktop menu bar and login.

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-login.png?raw=true)

5. Add project to Cypress app

  Once you've logged in click on the plus button and add the `dcos-ui` folder.

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-no-projects.png?raw=true)

### Running Integration Tests

1. Serve the integration test environment:

  ```sh
  npm run testing
  ```

2. Click on the project in the Cypress app to start the server

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-project.png?raw=true)

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-server-running.png?raw=true)
