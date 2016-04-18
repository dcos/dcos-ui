import React from 'react';

import AuthStore from '../stores/AuthStore';
import PluginSDK from 'PluginSDK';
/*
 * Exports a higher-order component that checks if user is logged in using the
 * AuthStore. If the user is logged in, the component will render.
 * If the user is not logged in, the user will be redirected to the login page.
 */
module.exports = function (ComposedComponent) {
  return class Authenticated extends React.Component {

    static willTransitionTo(transition) {
      if (!AuthStore.isLoggedIn()) {
        PluginSDK.Hooks.doAction('redirectToLogin', transition);
      }
    }

    render() {
      return (
        <ComposedComponent {...this.props} />
      );
    }
  };
};
