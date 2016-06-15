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
  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR,
  PLUGINS_CONFIGURED
} from './constants/EventTypes';
import appRoutes from './routes/index';
import Config from './config/Config';
import ConfigStore from './stores/ConfigStore';
import MesosSummaryStore from './stores/MesosSummaryStore';
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
      let loadedResources = {
        mesos: false
      };
      let mesosEvents = [MESOS_SUMMARY_CHANGE, MESOS_SUMMARY_REQUEST_ERROR];

      // Responsible for checking if application is ready to render
      function delayOrLoadApplication() {
        // Check if we've loaded all resources first
        let resources = Object.keys(loadedResources);
        let allLoaded = resources.reduce(function (memo, resource) {
          if (loadedResources[resource] === false) {
            memo = false;
          }

          return memo;
        }, true);

        if (allLoaded === false) {
          return;
        }

        // Next - check to see if enough time has elapsed before rendering
        let timeSpentLoading = Date.now() - global.getPageLoadedTime();
        let msLeftOfDelay = Config.applicationRenderDelay - timeSpentLoading;

        if (msLeftOfDelay <= 0) {
          renderApplicationToDOM();
        } else {
          setTimeout(delayOrLoadApplication, msLeftOfDelay);
        }
      }

      // Let's make sure we get Mesos Summary data before we render app
      // Mesos may unreachable, so we will render even on request failure
      function onMesosSummaryChange() {
        // Keep polling until the system attaches another listener to summary
        function keepPollingAlive() {
          if (MesosSummaryStore.listeners(MESOS_SUMMARY_CHANGE).length > 1) {
            MesosSummaryStore.removeChangeListener(
              MESOS_SUMMARY_CHANGE, keepPollingAlive
            );
          }
        }
        MesosSummaryStore.addChangeListener(
          MESOS_SUMMARY_CHANGE, keepPollingAlive
        );

        mesosEvents.forEach(function (event) {
          MesosSummaryStore.removeChangeListener(event, onMesosSummaryChange);
        });
        loadedResources.mesos = true;
        delayOrLoadApplication();
      }

      // Mesos
      MesosSummaryStore.init();
      mesosEvents.forEach(function (event) {
        MesosSummaryStore.addChangeListener(event, onMesosSummaryChange);
      });

      function renderApplicationToDOM() {
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
    }

    PluginSDK.Hooks.doAction('applicationRendered');
  }

  function onPluginsLoaded() {
    PluginSDK.Hooks.removeChangeListener(PLUGINS_CONFIGURED, onPluginsLoaded);
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
  PluginSDK.Hooks.addChangeListener(PLUGINS_CONFIGURED, onPluginsLoaded);
  ConfigStore.addChangeListener(CONFIG_ERROR, onConfigurationError);

  // Load configuration
  ConfigStore.fetchConfig();
})();
