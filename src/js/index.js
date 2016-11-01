import 'babel-polyfill';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import ReactDOM from 'react-dom';
import {RequestUtil} from 'mesosphere-shared-reactjs';
import {Router, hashHistory} from 'react-router';
import {Provider} from 'react-redux';
import PluginSDK from 'PluginSDK';
// Load in our CSS.
// TODO - DCOS-6452 - remove component @imports from index.less and
// require them in the component.js
import '../styles/index.less';
import './utils/MomentJSConfig';
import './utils/ReactSVG';
import {
  CONFIG_ERROR
} from './constants/EventTypes';
import appRoutes from './routes/index';
import ConfigStore from './stores/ConfigStore';
import RequestErrorMsg from './components/RequestErrorMsg';
import RouterUtil from './utils/RouterUtil';
import ApplicationUtil from './utils/ApplicationUtil';

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
    function renderAppToDOM(content) {
      ReactDOM.render(content, domElement, function () {
        PluginSDK.Hooks.doAction('applicationRendered');
      });
    }

    // Allow overriding of application contents
    let contents = PluginSDK.Hooks.applyFilter('applicationContents', null);
    if (contents) {
      renderAppToDOM(contents);
    } else {
      if (PluginSDK.Hooks.applyFilter('delayApplicationLoad', true)) {
        // Let's make sure we get Mesos Summary data before we render app
        // Mesos may unreachable, so we will render even on request failure
        ApplicationUtil.beginTemporaryPolling(function () {
          ApplicationUtil.invokeAfterPageLoad(renderApplicationToDOM);
        });
      } else {
        renderApplicationToDOM();
      }

      function renderApplicationToDOM() {
        let routes = RouterUtil.buildRoutes(appRoutes.getRoutes());

        renderAppToDOM(
          <Provider store={PluginSDK.Store}>
            <Router history={hashHistory} routes={routes} />
          </Provider>
        );

        PluginSDK.Hooks.doAction('routes', routes);
      }
    }
  }

  function onPluginsLoaded() {
    PluginSDK.Hooks.removeAction('pluginsConfigured', onPluginsLoaded);
    ConfigStore.removeChangeListener(CONFIG_ERROR, onConfigurationError);
    renderApplication();
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

  // Plugins events
  PluginSDK.Hooks.addAction('pluginsConfigured', onPluginsLoaded);
  ConfigStore.addChangeListener(CONFIG_ERROR, onConfigurationError);

  // Load configuration
  ConfigStore.fetchConfig();
})();
