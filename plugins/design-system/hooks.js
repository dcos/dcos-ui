/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DesignSystem from './components/DesignSystem';

const SDK = require('./SDK').getSDK();

const {Icon, DOMUtils} = SDK.get(['Icon', 'DOMUtils']);

module.exports = {
  configuration: {},

  initialize() {
    SDK.Hooks.addAction(
      'applicationRendered',
      this.applicationRendered.bind(this)
    );
    SDK.Hooks.addFilter('applicationContents',
      this.applicationContents.bind(this)
    );
    this.configure(SDK.config);
  },

  configure(configuration) {
    // Only merge keys that have a non-null value
    Object.keys(configuration).forEach((key) => {
      if (configuration[key] != null) {
        this.configuration[key] = configuration[key];
      }
    });
  },

  applicationRendered() {
    console.log('app rendered');
  },

  applicationContents() {
    return <DesignSystem />;
  }
};
