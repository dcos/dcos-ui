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
- [i18n](#i18n)
  - [Translation IDs](#translation-ids)
  - [Translation Strings](#translation-strings)
  - [New Translation files](#new-translation-files)
- [Packages](#packages)

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

* **feat** -
  use this type for commits that introduce a new features or capabilities
* **fix** - use this one for bug fixes
* **perf** - use this type for performance improvements
* **docs** - use this one to indicate documentation adjustments and improvements
* **chore** - use this type for _maintainance_ commits e.g. removing old files
* **style** - use this one for commits that fix formatting and linting errors
* **refactor** -
  use this type for adjustments to improve maintainability or performance
* **test** - use this one for commits that add new tests

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

1. Install the new package
  * The command below will install and save dependencies in `package.json`

    ```
    npm install [your package] --save --save-exact
    ```

  * Then, (if needed) add the package to devDependencies

    ```
    npm install [your package] --save-dev --save-exact
    ```

2. Create a synced npm-shrinkwrap.json with devDependencies included by running

    ```
    npm run shrinkwrap
    ```

We have a fixShrinkwrap script wich runs when you run `npm run shrinkwrap`, which takes care of the extra fsevents. You only need to manually remove it if shrinkwrap runs automatically. <br>
For more info https://github.com/npm/npm/issues/2679

3. Commit to repository

## ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI,
it is helpful to use [npm link](https://docs.npmjs.com/cli/link).

1. Run `npm run dist-src` in your `reactjs-components` directory.
2. Run `npm link` in your `reactjs-components` directory.
3. Run `npm link reactjs-components` in your `dcos-ui` directory.
4. Run `export REACTJS_COMPONENTS_LOCAL=true; npm start` to start the Webpack dev server with the proper configuration variable.
5. After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.

## Development Setup (Sublime Text Only)

1. Add the following to your Sublime Text User Settings:

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

2. Add Sublime-linter with jshint & jsxhint:

  * Installing SublimeLinter is straightforward using Sublime Package Manager, see [instructions](http://sublimelinter.readthedocs.org/en/latest/installation.html#installing-via-pc)
  * SublimeLinter-eslint needs a global eslint in your system, see [instructions](https://github.com/roadhump/SublimeLinter-eslint#sublimelinter-eslint)

3. Syntax Highlighting for files containing JSX

  * Install Babel using Sublime Package Manager, see [instructions](https://github.com/babel/babel-sublime). From here you can decide to use Babel for all .js files. See their docs for that. If you don't want to do that, continue reading.
  * Installing ApplySyntax using Sublime Package Manager, see [instructions](https://github.com/facelessuser/ApplySyntax)
  * Open up the user configuration file for ApplySyntax: `Sublime Text` -> `Preferences` -> `Package Settings` -> `ApplySyntax` -> `Settings - User`
  * Replace the contents with this:

    ```json
    {
      // Put your custom syntax rules here:
      "syntaxes": [
        {
          "name": "Babel/JavaScript (Babel)",
          "rules": [
            {"first_line": "^\\/\\*\\*\\s@jsx\\sReact\\.DOM\\s\\*\\/"}
          ]
        }
      ]
    }
    ```

## Testing

**Why is testing necessary?** 

Many of us like to sleep at night. So to give us peace of mind when we release a
new version of our software, we want to guarantee that the application works as it should, always. To accomplish this, we write two kinds of tests that will ensure that our applications behave as it should even as we add new features.

## Organizing Tests

It is common practice, to group automated tests in categories concerning how broad their scope is, and their execution requirements, that is often called the pyramid of testing (link reference). In DC/OS UI we use three levels of testing: Unit, Integration, and System.

Unit Tests (link) are intended to verify functionality at the minimal level of isolation, for that purpose, they tend to be small, and mock/stub all its dependencies. They also tend to execute fast and in a reliable way.

A system is often composed of a collection of components, that when tested in isolation perform correctly, but fail to do so together since specific problems only arise due to particular patterns of interaction between those elements. 

Integration Tests (link) verify that those well-tested units do not fail when they interact with other parts of the system. When it comes to their execution, they tend to be harder to set up, more complex, slower than unit tests and it is often harder to exercise all possible scenarios. Those tests still rely on mocks/stubs for external services, or to create situations that do not come very often. They are also more prone to failure because of the environments they execute.

While Integration Tests looks for the composition of the system,  System tests(link) try to be as close as possible to a real system (in the case of DC/OS, against a real cluster). They are harder to setup because of their need for many real running components, they tend to be slower and more often prone to fail ocasionaly due to network issues and latency.

## Unit Tests

To ensure that individual units of code (functions/methods) return the expected results with different inputs we write Unit Tests.

Think of a `sum` function. When called as `sum(1)` we may expect a return value of `1`. When called as `sum(1, 2)` we may expect a return value of `3`. And when called with no arguments, we may expect the result to fail with an error.



**Why testing code matters?** 

Many of us like to sleep at night. So to give us peace of mind when we release a 
new version of our software, we want to guarantee that the application works as 
it should, always. To accomplish this we write two kinds of tests that will 
ensure that our applications behaves as it should even as we add new features.

## Unit Tests

These tests ensure that individual units of code (functions/methods) return the 
expected results with different inputs.
Think of a `sum` function. When called as `sum(1)` we may expect a return value 
of `1`. When called as `sum(1, 2)` we may expect a return value of `3`. And when
 called with no arguments, we may expect an error to be thrown.

### Running Unit Tests

Make sure your packages are up to date by running `npm install`, and then run 
tests with:

```sh
npm test
```

## Integration Tests

We want to guarantee that our project DC/OS UI works as it should within DC/OS 
as a product. To do this we want our integration tests to run against a DC/OS 
cluster. For example we want to test that when an slave fails in a cluster, 
the UI visually shows this slave failure. A different example is validating 
that when a new service is installed on a cluster it will show up in the services page.

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

  ![img](https://github.com/dcos/dcos-ui/blob/master/docs/images/cypress-desktop-icon.png?raw=true)

4. Login with Github. Click on the icon on your desktop menu bar and login.

  ![img](https://github.com/dcos/dcos-ui/blob/master/docs/images/cypress-login.png?raw=true)

5. Add project to Cypress app

  Once you've logged in click on the plus button and add the `dcos-ui` folder.

  ![img](https://github.com/dcos/dcos-ui/blob/master/docs/images/cypress-no-projects.png?raw=true)

### Running Integration Tests

1. Serve the integration test environment:

  ```sh
  npm run testing
  ```

2. Click on the project in the Cypress app to start the server

  ![img](https://github.com/dcos/dcos-ui/blob/master/docs/images/cypress-project.png?raw=true)

  ![img](https://github.com/dcos/dcos-ui/blob/master/docs/images/cypress-server-running.png?raw=true)


## i18n

DCOS UI uses [React-Intl](https://github.com/yahoo/react-intl) to enable i18n, please look at the documentation. Currently this project is only supporting `en-us` but planning to support more languages/locales in the future.

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

When formatting a string containing multiple pieces of logic and/or translation IDs you can follow the [documentation here](https://github.com/yahoo/react-intl/wiki/Components#string-formatting-components) where you can also work with plural strings
but if you are looking to compose a normal string with a plural string you can use the component [formattedPlural](https://github.com/yahoo/react-intl/wiki/Components#formattedplural).

Keep in mind that React-intl follows the React pattern where everything is a component that way making it easier to compose and reason about the application.

### New translation files

When adding a new translation file store in `src/js/translations` directory and give it a name based on the language code e.g `en-us` (United States) `en-ie` (Ireland).

## Packages

Documentation can be found [here](packages/README.md)
