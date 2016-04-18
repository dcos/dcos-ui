# DCOS UI

## Requirements

Node 4.x (and above) is **required**. We suggest using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) to keep multiple Node versions on your system.

## Local Setup

To install, run, and contribute to DCOS-UI on your local machine you will need to setup 3 different environments (listed below).  The DCOS UI is the actual application code that runs as a standalone server.  The DCOS UI Proxy is a simple Vagrant Machine that connects requests from your local DCOS UI Application Server to a DCOS Cluster (local or remote).  Optionally, you may also run a DCOS Image, also a simple Vagrant Machine, to act as a local install of the DCOS.

* [DCOS Image](#dcos-image)
* [DCOS UI Proxy](#dcos-ui-proxy) (Optional)
* [DCOS UI](#dcos-ui-1)

### DCOS UI Proxy

This is a simple Vagrant machine which acts as a proxy between your local DCOS UI Application Server and an active DCOS Cluster. Since the assets for the DCOS UI Application needs to make requests to endpoints located on the local DCOS Image (or a remote DCOS Cluster) which resides on a different domain, this will normally cause CORS problems due to browser security policies. This vagrant machine solves this problem by proxying both requests through the same domain.
Pick one of the options below:

##### Remote DCOS Cluster

The instructions in the following section ([DCOS Image](#dcos-image)) have you setup a local DCOS Cluster in a virtual machine on your computer.  If you would like to instead have your local DCOS UI Application work of a remote DCOS Cluster, you will need to modify the DCOS UI Proxy you setup and ran in the steps above.  Follow these simple steps:

1. Navigate to the directory in which you installed and are running your DCOS UI Proxy
2. `vagrant ssh`
3. `sudo vi /etc/nginx/sites-enabled/dcos-ui`
4. Change the `proxy_pass` address in the now open text file to the address of the remote DCOS Cluster.  Be sure to comment-out or remove any other `proxy_pass` definitions.
5. Save the configuration file (e.g. `:wq`)
6. `sudo service nginx restart`

##### Installation Instructions:

1. Download the latest `dcos-ui` file from the Mesosphere Google Drive in the directory `Engineering/Frontend/Vagrant Machines`
3. `vagrant box add dcos-ui file:///PATH/dcos-ui` (replace PATH with the path to the dcos-ui file you just downloaded)
4. `mkdir vagrant-dcos-ui && cd vagrant-dcos-ui`
5. `vagrant init dcos-ui`
6. `vagrant up`
7. Create an entry in your `/etc/hosts` (e.g. `sudo nano /etc/hosts` to open and edit) file for `192.168.50.5 dcos.local`.
6. Navigate http://dcos.local

**NOTE:** `http://dcos.local` will only resolve if both your DCOS UI Server and DCOS Image/Cluster are operational and running.

### DCOS Image

The DCOS Image will create a virtual machine on your computer. This machine will contain a small version of a DCOS cluster. In short, it'll have a Mesos Master, Slave, and Marathon along with other packages that are needed for DCOS to operate.

**NOTE:** You can skip this step if your DCOS UI Proxy (see [DCOS UI Proxy](#dcos-ui-proxy) above) is pointing to a remote DCOS Cluster.

##### Installation Instructions:

1. `mkdir vagrant-dcos-image && cd vagrant-dcos-image`
2. `curl https://downloads.dcos.io/dcos/testing/continuous/make_dcos_vagrant.sh > make_dcos_vagrant.sh`
3. `chmod +x make_dcos_vagrant.sh`
4. `./make_dcos_vagrant.sh`
5. `vagrant up`

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

After install all development dependencies and configuring your local environment (steps 1-4 above), you can run test by running `npm test`.  You can build assets, without actually running the DCOS UI server by running `npm run dist`.  If you are actively developing, you may want to run `npm run livereload` to avoid having to refresh your browser with every change.

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
