// Load in our CSS.
// TODO - DCOS-6452 - remove component @imports from index.less and
// require them in the component.js
import '../styles/index.less';

import PluginSDK from 'PluginSDK';

import 'babel-polyfill';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import ReactDOM from 'react-dom';
import {RequestUtil} from 'mesosphere-shared-reactjs';
import Router from 'react-router';
import {Provider} from 'react-redux';

require('./utils/MomentJSConfig');
require('./utils/ReactSVG');
require('./utils/StoreMixinConfig');

import ApplicationLoader from './pages/ApplicationLoader';
import appRoutes from './routes/index';
import Config from './config/Config';
import ConfigStore from './stores/ConfigStore';
import RouterUtil from './utils/RouterUtil';

let domElement = document.getElementById('application');

// Load configuration
ConfigStore.fetchConfig();

// Patch json
let oldJSON = RequestUtil.json;
RequestUtil.json = function (options = {}) {
  // Proxy error function so that we can trigger a plugin event
  let oldHandler = options.error;
  options.error = function () {
    if (typeof oldHandler === 'function') {
      oldHandler.apply(null, arguments);
    }
    PluginSDK.Hooks.doAction('AJAXRequestError', ...arguments);
  };

  oldJSON(options);
};

function onApplicationLoad() {
  // Allow overriding of application contents
  let contents = PluginSDK.Hooks.applyFilter('applicationContents', null);
  if (contents) {
    ReactDOM.render(
      (<Provider store={PluginSDK.Store}>
        contents
      </Provider>),
      domElement);
  } else {
    setTimeout(function () {
      let routes = RouterUtil.buildRoutes(appRoutes.getRoutes());
      let router = Router.run(routes, function (Handler, state) {
        Config.setOverrides(state.query);
        ReactDOM.render(
          (<Provider store={PluginSDK.Store}>
            <Handler state={state} />
          </Provider>),
          domElement);
      });

      PluginSDK.Hooks.doAction('applicationRouter', router);
    });
  }

  PluginSDK.Hooks.doAction('applicationRendered');
}

ReactDOM.render(
  (<Provider store={PluginSDK.Store}>
    <ApplicationLoader onApplicationLoad={onApplicationLoad} />
  </Provider>),
  domElement
);
