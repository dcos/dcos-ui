# Contributing

## Index

- [Commits](#commits)
  - [Commit Message](#commit-message)
  - [Subject](#subjet)
  - [Type](#type)
  - [Scope](#scope)
  - [Message](#message)
  - [Referencing Issues](#referencing-issues)
  - [Breaking Changes](#breaking-changes)
  - [Examples](#examples)
- [ReactJS Components](#reactjs-components)
- [Testing](#testing)
  - [Unit Testing](#unit-testing)
  - [Integration Testing](#integration-testing)
  - [System Testing](#system-testing)
- [i18n](#i18n)
  - [Translation IDs](#translation-ids)
  - [Translation Strings](#translation-strings)
  - [New Translation files](#new-translation-files)
- [Packages](#packages)
- [Nice to knows](#nice-to-knows)
  - [Resolve webpack aliases in VSCode](#resolve-webpack-aliases-in-vscode)

## Commits

Please commit your changes frequently in small logical chunks that are
consistent, work independently of any later commits, and pass the linter as well
as the test suite. Doing so eases rollback and rebase operations.

You should also follow our commit message formatting rules, as they provide a
framework to write explicit messages that are easy to comprehend when looking
through the project history and enable automatic change log generation.

These Guidelines were written based on
[AngularJS Git Commit Message Conventions](https://goo.gl/27wkkO).

### Commit-Message

Each commit message should consist of a header (type, scope, subject), a body
and a footer separated by empty lines:

```
<type>(<scope>): <subject>

<message>

<footer>
```

Any line of the commit message must not be longer than 100 characters to ensure
that the messages are easy to read.

#### Subject

The subject contains a succinct description of the change. It should use the
imperative and present tense; “change” not “changed” nor “changes”.
Don't capitalize the first letter, and don't end it with a dot.

#### Type

The following commit types are allowed:

- **feat** -
  use this type for commits that introduce a new features or capabilities
- **fix** - use this one for bug fixes
- **perf** - use this type for performance improvements
- **docs** - use this one to indicate documentation adjustments and improvements
- **chore** - use this type for _maintainance_ commits e.g. removing old files
- **style** - use this one for commits that fix formatting and linting errors
- **refactor** -
  use this type for adjustments to improve maintainability or performance
- **test** - use this one for commits that add new tests

#### Scope

The scope should specify the place of the committed change.
Use the _class_, component, or filename if you only touched one "file",
otherwise use the page, module or package name.
Please don't list changed files and be as specific as possible.

#### Message

The message includes motivation for the change and contrasts with previous
behavior. It should use the imperative and present tense.

#### Referencing Issues

Closed issues should be listed on a separate line in the footer prefixed with
"Closes" keyword.

#### Breaking Changes

All breaking changes have to be mentioned in the footer with the description of
the change, justification and migration notes. Start the block explaining the
breaking changes with the words `BREAKING CHANGE:` followed by a space.

### Examples

```
fix(AwesomeComponent): remove console log statements

Remove log statements to prevent IE4 errors.

Closes ACME-123, ACME-456
```

```
refactor(*): change constant names

Adjust constant names, following the new naming conventions.

Closes ACME-123
```

```
refactor(VideoPlayer): simplify control interface

Simplify the VideoPlayer control interface as the current
interface is somewhat hard to use and caused bugs due
to accidental misuse.

BREAKING CHANGE: VideoPlayer control interface has changed
to simplify the general usage.

To migrate the code follow the example below:

Before:

VideoPlayer.prototype.stop({pause:true})

After:

VideoPlayer.prototype.pause()
```

## Adding npm Package Dependencies

If you want to add a new npm package to 'node_modules' you will need to `--save-exact`:

1.  Install the new package

- The command below will install and save dependencies in `package.json`

  ```
  npm install [your package] --save --save-exact
  ```

- Then, (if needed) add the package to devDependencies

  ```
  npm install [your package] --save-dev --save-exact
  ```

3.  Commit to repository

## ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI,
it is helpful to use [npm link](https://docs.npmjs.com/cli/link).

1.  Run `npm run dist-src` in your `reactjs-components` directory.
2.  Run `npm link` in your `reactjs-components` directory.
3.  Run `npm link reactjs-components` in your `dcos-ui` directory.
4.  Run `export REACTJS_COMPONENTS_LOCAL=true; npm start` to start the Webpack dev server with the proper configuration variable.
5.  After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.

## Development Setup (Sublime Text Only)

1.  Add the following to your Sublime Text User Settings:

```json
{
  ...
  "rulers": [80], // lines no longer than 80 chars
  "tab_size": 2, // use two spaces for indentation
  "translate_tabs_to_spaces": true, // use spaces for indentation
  "ensure_newline_at_eof_on_save": true, // add newline on save
  "trim_trailing_white_space_on_save": true, // trim trailing white space on save
  "default_line_ending": "unix"
}
```

2.  Add Sublime-linter with jshint & jsxhint:

- Installing SublimeLinter is straightforward using Sublime Package Manager, see [instructions](http://sublimelinter.readthedocs.org/en/latest/installation.html#installing-via-pc)
- SublimeLinter-eslint needs a global eslint in your system, see [instructions](https://github.com/roadhump/SublimeLinter-eslint#sublimelinter-eslint)

3.  Syntax Highlighting for files containing JSX

- Install Babel using Sublime Package Manager, see [instructions](https://github.com/babel/babel-sublime). From here you can decide to use Babel for all .js files. See their docs for that. If you don't want to do that, continue reading.
- Installing ApplySyntax using Sublime Package Manager, see [instructions](https://github.com/facelessuser/ApplySyntax)
- Open up the user configuration file for ApplySyntax: `Sublime Text` -> `Preferences` -> `Package Settings` -> `ApplySyntax` -> `Settings - User`
- Replace the contents with this:

  ```json
  {
    // Put your custom syntax rules here:
    "syntaxes": [
      {
        "name": "Babel/JavaScript (Babel)",
        "rules": [{ "first_line": "^\\/\\*\\*\\s@jsx\\sReact\\.DOM\\s\\*\\/" }]
      }
    ]
  }
  ```

## Testing

### Why is testing necessary?

Many of us like to sleep at night. So to give us peace of mind when we release a
new version of our software, we want to guarantee that the application works as
it should, always. To accomplish this, we write two kinds of tests that will
ensure that our applications behave as it should even as we add new features.

### Organizing Tests

It is common practice, to group automated tests in categories depending on how
broad their scope is, and how complex their execution requirements are.
This separation often follows the
[testing pyramid](https://martinfowler.com/bliki/TestPyramid.html).
In DC/OS UI we use three levels of testing: Unit, Integration, and System.

[Unit Tests](#unit-testing) are intended to verify functionality at the minimal
level of isolation, for that purpose, they tend to be small, and mock/stub all
its dependencies. They also tend to execute fast and in a reliable way.

Given a system is composed of a collection of components, that when tested
in isolation perform correctly, but often fail to do so together, we use both
integration testing and system testing to verify behavior at an increasing
larger scope (bringing increased execution requirements).

[Integration Tests](#integration-testing) verify that the well-tested units do
not fail when they interact with components they depend on internally (part of
the same project), but will stub/mock external dependencies (from other
systems/projects). Compared to unit testing, integration tests tend to be harder
to execute, since they rely on an environment similar to production (e.g. they
run ion the browser). They also tend to be slower than unit tests making it
impossible to exercise all possible scenarios.

While Integration Tests looks for the composition within the system,
[System Tests](#system-testing) test the integration with the real external
dependencies trying to as close as possible to the production use of a client
(in the case of DC/OS, against a real cluster). They are even harder to setup
than integration tests because you often have to create custom tooling to
operate the whole product. This contributes to them being slower and more often
prone to fail occasionally, for example, because of network issues like latency.

## Unit Testing

To ensure that individual units of code (functions/methods) return the expected
results with different inputs we write Unit Tests.

Think of a `sum` function. When called as `sum(1)` we may expect a return value
of `1`. When called as `sum(1, 2)` we may expect a return value of `3`. And when
called with no arguments, we may expect the result to fail with an error.

### Running Unit Tests

Before you run any test, make sure you have
[set up your environment](/#dcos-installation-instructions).

Make sure your packages are up to date by running `npm install`, and then run
tests with:

```sh
npm test
```

Use `test:watch` if you want the tests to run automatically when a file changes:

```sh
npm run test:watch
```

You can even pass parameters to the test engine (in this case jest), when you,
for instance, want to run a single spec, for example, `MesosStateUtil`:

```sh
npm run test -- --watch MesosStateUtil
```

### Example of a Unit Test

This test verifies that unit `decomposePodTaskId` when given the input string
"podname.instance-instancename.taskname" returns an object with the `podID`,
`instanceID` and `taskName respectively`.

```js
describe("#decomposePodTaskId", function() {
  it("de-composes task ids", function() {
    expect(
      MesosStateUtil.decomposePodTaskId(
        "podname.instance-instancename.taskname"
      )
    ).toEqual({
      podID: "podname",
      instanceID: "instancename",
      taskName: "taskname"
    });
  });
});
```

### Writing Unit Tests

A recommended reading is [Better Specs](http://www.betterspecs.org/), we put
[real effort](https://github.com/dcos/dcos-ui/pull/2524) in making sure we
follow these guidelines. Some of the most common ones to follow:

- Single Expectation test: Every unit test should verify one behavior (and one behavior only).
- Keep your descriptions concise (bellow 40 chars ideally): One easy way to achieve this one is avoiding using "should" (e.g. "it does not use should" instead of "it should not be written with should").
- Create only the data you need: Especially if you have a more complicated scenario, just generate the data that is relevant to that particular case.

For more on this topic, and examples we recommend
[Better Specs](http://www.betterspecs.org/).

### Testing rxjs observables with marbles diagrams

Before you begin please read the introduction on [what the marbles diagrams are](https://github.com/ReactiveX/rxjs/blob/5.4.2/doc/writing-marble-tests.md).
Since there's no official helpers to write tests levereging the marbles diagrams we're using [rxjs-marbles](https://github.com/cartant/rxjs-marbles) library.

The most important thing you should do is wrapping your usual test case function with `marble` function

```js
import { marbles } from "rxjs-marbles/jest";

it(
  "tests marbles",
  marble(function(m) {
    // My test case
  })
);
```

it will inject the Context conventionally named `m` that exposes the helpers API.

#### Example of a marble test

```js
import { marbles } from "rxjs-marbles/jest";
import { linearBackoff } from "../rxjsUtils";

describe("linearBackoff", function() {
  it(
    "retries maxRetries times",
    // To setup marbles test env pass your function wrapped with `marbels`
    // it will inject Context as the first argument named `m` by convention
    marbles(function(m) {
      // with `m.bind` we bind all time dependent operators to a TestScheduler
      // so that we can use mocked time intervals.
      // But we also could create our own TestScheduler and use it instead.
      m.bind();

      const source = m.cold("1--2#");
      const expected = m.cold("1--2--1--2----1--2------1--2#");

      // In test env we don't want to wait for the real wall clock
      // so we encode time intervals with a special helper `m.time`
      const result = source.retryWhen(linearBackoff(3, m.time("--|")));

      m.expect(result).toBeObservable(expected);
    })
  );
});
```

## Integration Testing

At the integration level, we are interested in verifying that the composition of
components works, more than the components independently. Integration tests
do not go into the details of the business logic, since those are covered by
unit testing.

Following the example of the `sum` function, imagine you are building a
graphical tool to display charts with data from a JSON API. An integration test
could be used to verify that the `plot` function works successfully by
leveraging the functions in the math library (like `sum`). For this test,
you should mock the external JSON API and provide a JSON with only the data
necessary to guarantee a particular chart is presented correctly.

### Integration tests setup

We use cypress to drive a browser and run the unit tests for DC/OS UI. This is
because we want to integrate our system as close as possible to the environment
it will run, the user browser.

### Running Integration Tests

1.1 Without Plugins

Run DC/OS UI in testing mode (you have to close `npm start`).

```sh
npm config delete externalplugins
npm run start:testing
```

1.1 With Plugins

```sh
npm config set externalplugins <path>
npm run test:integration:plugins:setup
npm run start:testing
```

NOTE: `npm run test:integration:plugins:setup` will copy plugins test over. Don't forged removing them. This is a workaround since Cypress can't run tests in multiple directories.

2.  Open Cypress app

```sh
npx cypress open
```

3.  Click on "Run All Tests" or in one of the test files,
    e.g. (PackageTab-cy.js).

![img](docs/images/cypress-run-tests.png?raw=true)

You should see a browser open and your tests running.

![img](docs/images/cypress-tests-running.png?raw=true)

### Example of an Integration test

You can see examples of integration tests for actions that could be performed
in a DC/OS Service by looking at
[ServiceAction-cy.js](https://github.com/dcos/dcos-ui/blob/master/tests/pages/services/ServiceActions-cy.js).

### Writing Integration Tests

Writing integration tests can be harder than unit tests, we recommend following best
practices from the
[cypress best practices](https://docs.cypress.io/guides/references/best-practices.html)
that, among other things, include:

- Avoid explicitly waiting for something with `cy.wait`: This will slow down your test suite, cypress is (usually) capable of wait and retry assertions automatically.

- Mock the external but not the internal: It is ok to mock external services, especially API responses, but not other dependencies of your system.

- Watch for flaky tests: Often some tests will sometimes fail and sometimes pass because of the way they are constructed. For instance, 90% of the time an asyncronous call will finish under a second, but when it does not, you test will fail.

- Leverage videos and screenshots: Cypress can record an image/video when a test fails, use it to help you understand what is going wrong with your test.

For more information, we recommend [cypress documentation](https://docs.cypress.io/guides/overview/why-cypress.html).

### Debugging flaky integration tests

We have tooling to check if a test case (or the implementation) is flaky.

1.  Open up a PR with your changes
2.  Add a `.only` on the test case you want to check and push the commit
3.  Wait for the `100` runs to finish
4.  Check the result on the PR status. If there is still a flake `continuous-integration/jenkins/pr-head` should be red.

If you want to test more runs you can change the number in `Jenkinsfile.reruns`.

## System Testing

At the System Test level, you want to guarantee that your project works on the
context of the whole system, in the case of DC/OS UI, that it works within DC/OS
as a product. To do this, we want our tests to run against a DC/OS cluster.
For example we want to test that when an slave fails in a cluster, the UI
visually shows this slave failure. A different example is validating that
when a new service is installed on a cluster, it will show up in the services
page.

### System Tests setup

In the DC/OS UI, System Tests are executed with the dcos-system-test-driver
utility; This utility takes care of provisioning a cluster, launching the
integration tests and driving the setup and teardown process for every test.

The system-test-driver-utility is currently **not available** for public use.

For contributing members of this repository. Comprehensive documentation on how
to run, write, debug and troubleshoot system tests are available in the
**System Tests in DC/OS UI** google document currently only available internally
at Mesosphere.

You will need a fully functional cluster to run your system tests.

## i18n

DCOS UI uses [lingui](https://github.com/lingui/js-lingui) to enable i18n, please look at the documentation. Currently this project is only supporting `en-us` but planning to support more languages/locales in the future.

### translations ids

When adding a new translation ID make sure there's no existent translation with the same ID to avoiding duplicated translations.
If you find an existing translation ID, make sure that the ID is `prepended` with `COMMON`.

When creating a new **translation ID** please follow the convention/pattern bellow:

- Only uppercase.
- No special characters **BUT** dot (`.`) and underscore (`_`) to create hierarchy.
- No Numbers.
- Prepend `COMMON` when should be used in more places.
- Prepend the component name `FAKECOMPONENT` when should be specific translation to a component.

In theory you can add any string as value but avoid using markup at any cost.

A good example of translations:

```javascript
{
  "COMMON.SUMMARY": "Summary":
  "COMMON.STATUS": "Status",
  "DASHBOARD.HEALTH_LIST": "Component Health List",
}
```

### Translations strings

When formatting a string containing multiple pieces of logic and/or translation IDs you can follow the [documentation here](https://lingui.js.org/tutorials/react.html#formatting). If you are looking to format a plural string you can use the [Plural](https://lingui.js.org/tutorials/react.html#plurals) macro. Note that the `Trans` macro must be imported in any file that uses the `Plural` macro, even if `Trans` is not used.

Keep in mind that lingui follows the React pattern where everything is a component that way making it easier to compose and reason about the application.

Ensure that `npm run util:lingui:extract-with-plugins` is run with every update to dcos-ui, and that any updates to `messages.json` are committed.

### New translation files

When adding a new translation file store in `src/js/translations` directory and give it a name based on the language code e.g `en-us` (United States) `en-ie` (Ireland).

## Packages

Documentation can be found [here](packages/README.md)

## Nice to knows

### Resolve webpack aliases in VSCode

Add this part to your `jsconfig.json` in the root of this project

```json
{
  "compilerOptions": {
    "baseUrl": "./", // all paths are relative to the baseUrl
    "paths": {
      "#SRC/*": ["dcos-ui/src/*"],
      "#LOCALE/*": ["dcos-ui/locale/*"],
      "#EXTERNAL_PLUGINS/*": ["dcos-ui-plugins-private/*"],
      "#PLUGINS/*": ["dcos-ui/plugins/*"]
    }
  }
}
```
