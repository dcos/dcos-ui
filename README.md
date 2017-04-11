# DC/OS UI [![Velocity](http://jenkins.mesosphere.com/buildStatus/icon?job=public-dcos-ui-master)](http://jenkins.mesosphere.com/view/DCOS%20UI/job/public-dcos-ui-master/)

The User Interface for The Datacenter Operating System.

The DC/OS UI is used by datacenter operators to administer and manage a datacenter. Developers use DC/OS UI to manage, deploy and debug their applications. The DC/OS UI sits at the top of the [DC/OS stack](https://dcos.io/docs/latest/overview/architecture/) along with the [CLI](github.com/dcos/dcos-cli).

* [Issue tracker](https://jira.dcos.io). Use component `dcos-ui`.
* [Documentation](https://dcos.io/docs/latest/usage/webinterface/)
* [Apache License v2](./LICENSE)

![DC/OS UI](./.github/dcos-ui.gif)

## Usage

### Requirements

Node 4.4.x and NPM 3.9.x (and above) are **required**. We suggest using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) to keep multiple Node versions on your system.

### DC/OS Installation Instructions:
1. Follow the instructions [here](https://github.com/dcos/dcos-vagrant) to install a local cluster.
2. Clone this repo:

  ```sh
  git clone git@github.com:dcos/dcos-ui.git && cd dcos-ui
  ```

3. Install dependencies:

  ```sh
  npm i
  ```

4. Add developer files for config overrides:

  ```sh
  npm run scaffold
  ```
  This will create `webpack/proxy.dev.js` and `src/js/config/Config.dev.js`. These files aren't tracked by git and provide a place to override proxy and general dcos-ui configuration. Edit `webpack/proxy.dev.js` to point to the  address of the `dcos-vagrant` machine.

5. Start the development server:

  ```sh
  npm start
  ```

6. Navigate to [http://localhost:4200](http://localhost:4200)

### Using External Plugins

DC/OS UI comes bundled with some internal plugins within the `/plugins` directory. You can also load more plugins from another directory and they will be loaded into DC/OS UI along with the internal plugins. To set a directory for external plugins run:
```sh
npm config set externalplugins ../relative/path/to/plugins/directory
```

<<<<<<< HEAD
## Contributing
=======
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
    npm shrinkwrap --dev
    ```

We have a fixShrinkwrap script wich runs when you run `npm run shrinkwrap`, which takes care of the extra fsevents. You only need to manually remove it if shrinkwrap runs automatically. <br>
For more info https://github.com/npm/npm/issues/2679

3. Commit to repository

## Development Setup (Sublime Text Only)

1. Add the following to your Sublime Text User Settings:

  ```js
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

3. Syntax Highlihgting for files containing JSX

  * Install Babel using Sublime Package Manager, see [instructions](https://github.com/babel/babel-sublime). From here you can decide to use Babel for all .js files. See their docs for that. If you don't want to do that, continue reading.
  * Installing ApplySyntax using Sublime Package Manager, see [instructions](https://github.com/facelessuser/ApplySyntax)
  * Open up the user configuration file for ApplySyntax: `Sublime Text` -> `Preferences` -> `Package Settings` -> `ApplySyntax` -> `Settings - User`
  * Replace the contents with this:

    ```js
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

>>>>>>> docs(README): Address wording and remove npm shrinkwrap command

[Contributing Guidelines](./CONTRIBUTING.md)

### Testing

See more info on testing [here](./TESTING.md).

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
