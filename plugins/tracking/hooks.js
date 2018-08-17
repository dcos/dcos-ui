/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import AuthStore from "#SRC/js/stores/AuthStore";
import Config from "#SRC/js/config/Config";
import DOMUtils from "#SRC/js/utils/DOMUtils";
import EventTypes from "#SRC/js/constants/EventTypes";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import Util from "#SRC/js/utils/Util";

import { ANALYTICS_LOAD_TIMEOUT } from "./constants/PluginConstants";
import Actions from "./actions/Actions";

const SDK = require("./SDK").getSDK();

const segmentScript = `!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error('Segment snippet included twice.');else{analytics.invoked=!0;analytics.methods=['trackSubmit','trackClick','trackLink','trackForm','pageview','identify','group','track','ready','alias','page','once','off','on'];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement('script');e.type="text/javascript";e.async=!0;e.src=('https:'===document.location.protocol?'https://':'http://')+'cdn.segment.com/analytics.js/v1/'+t+'/analytics.min.js';var n=document.getElementsByTagName('script')[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.0.1";analytics.load("${
  Config.analyticsKey
}");}}();`;

module.exports = {
  filters: [
    "pluginsLoadedCheck",
    "userFormModalFooter",
    "userLoginPolicy",
    "userAddPolicy"
  ],

  actions: [
    "pluginsConfigured",
    "userLoginSuccess",
    "userLogoutSuccess",
    "routes"
  ],

  initialize(configuration) {
    this.configuration = configuration;

    this.filters.forEach(filter => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });

    Actions.initialize();

    if (AuthStore.getUser()) {
      Actions.identify(AuthStore.getUser().uid);
    }

    DOMUtils.appendScript(global.document.head, segmentScript);
  },

  pluginsLoadedCheck(promiseArray) {
    const promise = new Promise(resolve => {
      global.analytics.ready(() => {
        resolve();
      });

      // Let's not block the application loading in case it takes a really
      // long time to ready-up analytics or the integrations.
      global.setTimeout(resolve, ANALYTICS_LOAD_TIMEOUT);
    });

    promiseArray.push(promise);

    return promiseArray;
  },

  pluginsConfigured() {
    // Ensure analytics is actually ready, because in #pluginsLoadedCheck we
    // may skip the check so that we don't completely block the applicaiton
    const metadata =
      Util.findNestedPropertyInObject(this, "configuration.metadata") || {};

    global.analytics.ready(() => {
      const setContext = () => {
        if (!global.Raven) {
          return;
        }

        global.Raven.setTagsContext({
          ...metadata,
          environment: process.env.NODE_ENV,
          dcosVersion: MetadataStore.version,
          dcosVariant: MetadataStore.variant
        });
      };

      if (!MetadataStore.version) {
        MetadataStore.addChangeListener(
          EventTypes.DCOS_METADATA_CHANGE,
          setContext
        );
      } else {
        setContext();
      }
    });
  },

  userLoginSuccess() {
    Actions.identify(AuthStore.getUser().uid);
  },

  routes(routes) {
    Actions.setRoutes(routes);
  },

  userLogoutSuccess() {
    Actions.log("dcos_logout");
  },

  userFormModalFooter() {
    return null;
  },

  userLoginPolicy() {
    return (
      <p>
        By logging in to DC/OS you understand we will process personal
        information in accordance with our{" "}
        <a href="https://mesosphere.com/privacy/" target="_blank">
          Privacy Policy
        </a>.
      </p>
    );
  },

  userAddPolicy() {
    return (
      <p className="form-control-feedback">
        By adding a user you understand we will process personal information in
        accordance with our{" "}
        <a
          className="reset-color"
          href="https://mesosphere.com/privacy/"
          target="_blank"
        >
          Privacy Policy
        </a>.
      </p>
    );
  }
};
