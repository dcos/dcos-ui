/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const AppLockedMessage = function () {
  return (
    <h4 className="text-align-center text-danger flush-top">
      Service is currently locked by one or more deployments. Press the button
      again to forcefully change and deploy the new configuration.
    </h4>
  );
};

module.exports = AppLockedMessage;
