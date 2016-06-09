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

import {
  CONFIG_ERROR,
  PLUGINS_CONFIGURED
} from './constants/EventTypes';
import appRoutes from './routes/index';
import Config from './config/Config';
import ConfigStore from './stores/ConfigStore';
import RequestErrorMsg from './components/RequestErrorMsg';
import RouterUtil from './utils/RouterUtil';

let domElement = document.getElementById('application');

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

(function () {
  function renderApplication() {
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

  function delayOrLoadApplication() {
    let timeSpentLoading = Date.now() - global.getPageLoadedTime();
    let msLeftOfDelay = Config.applicationRenderDelay - timeSpentLoading;

    if (msLeftOfDelay <= 0) {
      renderApplication();
    } else {
      setTimeout(delayOrLoadApplication, msLeftOfDelay);
    }
  }

  function onPluginsLoaded() {
    PluginSDK.Hooks.removeChangeListener(PLUGINS_CONFIGURED, onPluginsLoaded);
    delayOrLoadApplication();
  }

  function onConfigurationError() {
    // Try to find appropriate DOM element or fallback
    let element = document.querySelector('#canvas div') || domElement;
    let columnClasses = {
      'column-small-8': false,
      'column-small-offset-2': false,
      'column-medium-6': false,
      'column-medium-offset-3': false
    };

    ReactDOM.render(
      (<RequestErrorMsg
        columnClasses={columnClasses}
        header="Error requesting UI Configuration" />),
      element);
  }

  PluginSDK.Hooks.addChangeListener(PLUGINS_CONFIGURED, onPluginsLoaded);
  ConfigStore.addChangeListener(CONFIG_ERROR, onConfigurationError);

  // Load configuration
  ConfigStore.fetchConfig();
})();
