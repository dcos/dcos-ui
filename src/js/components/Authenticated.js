import React from "react";
import PluginSDK from "PluginSDK";

import AuthStore from "../stores/AuthStore";
/*
 * Exports a higher-order component that checks if user is logged in using the
 * AuthStore. If the user is logged in, the component will render.
 * If the user is not logged in, the user will be redirected to the login page.
 */
module.exports = function(ComposedComponent) {
  return class Authenticated extends React.Component {
    static willTransitionTo(nextState, replace) {
      if (!AuthStore.isLoggedIn()) {
        PluginSDK.Hooks.doAction("redirectToLogin", nextState, replace);
      }
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  };
};
