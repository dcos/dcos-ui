# DC/OS UI [![Velocity](http://velocity.mesosphere.com/service/velocity/buildStatus/icon?job=public-dcos-ui-master)](http://velocity.mesosphere.com/service/velocity/view/DCOS%20UI/job/public-dcos-ui-master/)

## Requirements

Node 4.x (and above) is **required**. We suggest using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) to keep multiple Node versions on your system.


## DC/OS Installation Instructions:
1. Follow the instructions [here](https://github.com/dcos/dcos-vagrant) to install a local cluster.
2. In your dcos-vagrant repo from the previous step, run:

  ```
  vagrant ssh m1
  ```

3. Open `nginx.conf` for adminrouter with:

  ```
  sudo vi /opt/mesosphere/active/adminrouter/nginx/conf/nginx.conf
  ```

4. Find the line:

  ```
  root /opt/mesosphere/active/dcos-ui/usr;
  ```

  and comment out by changing the line to:

  ```
  # root /opt/mesosphere/active/dcos-ui/usr;
  ```

5. Right below the commented out line, add

  ```
  location ~ ^/(?!service|mesos).*\.(js|css|html|png|jpg|gif|jpeg|swf|map)$ {
    expires -1;
    add_header Cache-Control "no-store";
    proxy_pass http://10.0.2.2:4200;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
  }
  ```
6. Save and quit vi
7. Restart adminrouter with `sudo service dcos-adminrouter restart`. Your cluster is now prepped for local development.
8. [Start](#user-content-dcos-ui-1) your local development server for DC/OS.
9. Navigate to http://dcos.local.

**NOTE:** http://dcos.local will only resolve if both your DC/OS UI Server and DC/OS Cluster are operational and running.

## DC/OS UI

This repository contains the DC/OS UI application.

##### Installation Instructions:

1. Clone this repository (https://github.com/mesosphere/dcos-ui)
2. Install [NPM](https://npmjs.org/)
3. Install development dependencies

  ```sh
  npm install
  npm install -g gulp
  ```

4. Setup development project configuration

  * Copy `src/js/config/Config.template.js` to `src/js/config/Config.dev.js`
  * Override variables in `Config.dev.js` to reflect your local development configuration

5. Run development environment

  ```sh
  npm run serve
  ```

After installing all development dependencies and configuring your local environment (steps 1-4 above), you can run test by running `npm test`.  You can build assets, without actually running the DC/OS UI server by running `npm run dist`.  If you are actively developing, you may want to run `npm run livereload` to avoid having to refresh your browser with every change.

## Adding npm Package Dependencies

If you want to add a new npm package to 'node_modules':

1. Install the new package
  * Install and save dependencies in `package.json`

    ```
    npm install [your package] --save
    ```

  * Then, add the package to devDependencies

    ```
    npm install [your package] --save-dev
    ```

2. Create a synced npm-shrinkwrap.json with devDependencies included by running

    ```
    npm shrinkwrap --dev
    ```

3. Commit to repository

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

3. Syntax Highlihgting for files containing JSX

  * Install Babel using Sublime Package Manager, see [instructions](https://github.com/babel/babel-sublime). From here you can decide to use Babel for all .js files. See their docs for that. If you don't want to do that, continue reading.
  * Installing ApplySyntax using Sublime Package Manager, see [instructions](https://github.com/facelessuser/ApplySyntax)
  * Open up the user configuration file for ApplySyntax: `Sublime Text` -> `Preferences` -> `Package Settings` -> `ApplySyntax` -> `Settings - User`
  * Replace the contents with this:

    ```
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

See more info on testing [here.](./TESTING.md)


## License and Author

Copyright 2016 Mesosphere, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this repository except in compliance with the License.

The contents of this repository are solely licensed under the terms described in the [LICENSE file](./LICENSE) included in this repository.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Authors are listed in [Authors.md file](./Authors.md).
