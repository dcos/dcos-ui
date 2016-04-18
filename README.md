# DCOS UI [![Velocity](http://velocity.mesosphere.com/service/velocity/buildStatus/icon?job=dcos-ui-master)](http://velocity.mesosphere.com/service/velocity/view/DCOS%20UI/job/dcos-ui-master/)

## Requirements

Node 4.x (and above) is **required**. We suggest using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) to keep multiple Node versions on your system.

## Local Setup

To install, run, and contribute to DCOS-UI on your local machine you will need to setup 2 environments.
1. The DC/OS UI running as a standalone server for development.
2. A local install of DC/OS.

* [DC/OS](#dcos-image)
* [DC/OS UI](#user-content-dcos-ui-1)



##### DC/OS Installation Instructions:
1. Follow the instructions [here](https://github.com/dcos/dcos-vagrant) to install a local cluster.
2. In your dcos-vagrant repo from th previous step, run `vagrant ssh m1`.
3. Open `nginx.conf` for adminrouter with `sudo vi /opt/mesosphere/active/adminrouter/nginx/conf/nginx.conf`
4. Comment out `root /opt/mesosphere/active/dcos-ui/usr;` by changing the line to `# root /opt/mesosphere/active/dcos-ui/usr;`

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
8. Start your local development server for [DC/OS UI](#user-content-dcos-ui-1).
9. Navigate to `http://dcos.local`.

**NOTE:** `http://dcos.local` will only resolve if both your DC/OS UI Server and DC/OS Cluster are operational and running.

### DCOS UI

This repository contains the DCOS UI application. The application gathers data from endpoints located on the DCOS Image.

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

After installing all development dependencies and configuring your local environment (steps 1-4 above), you can run test by running `npm test`.  You can build assets, without actually running the DCOS UI server by running `npm run dist`.  If you are actively developing, you may want to run `npm run livereload` to avoid having to refresh your browser with every change.

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
    npm run shrinkwrap
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

**Why is testing important?** Many of us like to sleep at night. So to give us peace of mind when we release a new version of our software, we want to guarantee that the application works as it should, always. To accomplish this we write two kinds of tests that will ensure that our applications behaves as it should even as we add new features.

### Unit tests

These tests ensure that individual units of code (functions/methods) return the expected results with different inputs.
Think of a `sum` function. When called as `sum(1)` we may expect a return value of `1`. When called as `sum(1, 2)` we may expect a return value of `3`. And when called with no arguments, we may expect an error to be thrown.

### Integration tests

We want to guarantee that our project DCOS UI works as it should within DCOS as a product. To do this we want our integration tests to run against a DCOS cluster. For example we want to test that when an slave fails in a cluster, the UI visually shows this slave failure. A different example is validating that when a new service is installed on a cluster it will show up in the services page.

##### Setup Instructions:

1. Install Cypress CLI

  ```sh
  npm install -g cypress
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

6. Once the project is added click on it to start the server

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-project.png?raw=true)

  ![img](../../../../../../../mesosphere/dcos-ui/blob/master/docs/images/cypress-server-running.png?raw=true)

7. Ask someone on the team to teach all about writing integration tests.
