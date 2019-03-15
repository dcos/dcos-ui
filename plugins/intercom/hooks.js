import { Hooks } from "PluginSDK";

import DOMUtils from "#SRC/js/utils/DOMUtils";
import AuthStore from "#SRC/js/stores/AuthStore";

import { INTERCOM_CHANGE } from "./constants/EventTypes";
import IntercomStore from "./stores/IntercomStore";

const SDK = require("./SDK").getSDK();

const INTERCOM_LOAD_TIMEOUT = 500;

export default {
  filters: ["pluginsLoadedCheck"],
  actions: ["pluginsConfigured", "userLoginSuccess", "userLogoutSuccess"],

  initialize(configuration) {
    this.configuration = configuration;

    this.filters.forEach(filter => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });

    this.bootIntercom = this.bootIntercom.bind(this);
    this.onIntercomStoreUpdate = this.onIntercomStoreUpdate.bind(this);

    const intercomScript = `
      var APP_ID = "${this.configuration.appId}";
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/' + APP_ID;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()
    `;

    DOMUtils.appendScript(global.document.head, intercomScript);
  },

  pluginsLoadedCheck(promiseArray) {
    const promise = new Promise(resolve => {
      if (global.Intercom) {
        resolve();
      }

      setTimeout(resolve, INTERCOM_LOAD_TIMEOUT);
    });

    promiseArray.push(promise);

    return promiseArray;
  },

  pluginsConfigured() {
    if (AuthStore.isLoggedIn()) {
      this.bootIntercom();
    }
  },

  userLoginSuccess() {
    this.bootIntercom();
  },

  userLogoutSuccess() {
    IntercomStore.removeChangeListener(
      INTERCOM_CHANGE,
      this.onIntercomStoreUpdate
    );

    global.Intercom("shutdown");

    Hooks.doAction("intercomShutdown");
  },

  onIntercomStoreUpdate() {
    global.Intercom("update", IntercomStore.attributes);
  },

  bootIntercom() {
    const user = AuthStore.getUser();

    global.Intercom("boot", {
      app_id: this.configuration.appId,
      email: user.email,
      name: AuthStore.getUserLabel()
    });

    IntercomStore.addChangeListener(
      INTERCOM_CHANGE,
      this.onIntercomStoreUpdate
    );

    Hooks.doAction("intercomBoot");
  }
};
