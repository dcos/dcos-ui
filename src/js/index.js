import PluginSDK from 'PluginSDK';

import _ from 'underscore';
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import {Provider} from 'react-redux';

require('./utils/MomentJSConfig');
require('./utils/ReactSVG');
require('./utils/StoreMixinConfig');

import ApplicationLoader from './pages/ApplicationLoader';
import appRoutes from './routes/index';
import Config from './config/Config';
import ConfigStore from './stores/ConfigStore';
import RequestUtil from './utils/RequestUtil';

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

function createRoutes(routes) {
  return routes.map(function (route) {
    let args = [route.type, _.omit(route, 'type', 'children')];

    if (route.children) {
      let children = createRoutes(route.children);
      args = args.concat(children);
    }

    return React.createElement(...args);
  });
}

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
      let builtRoutes = createRoutes(
        appRoutes.getRoutes()
      );

      let router = Router.run(builtRoutes[0], function (Handler, state) {
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
