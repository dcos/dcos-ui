/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import Pod from "../../structs/Pod";
import ServiceTree from "../../structs/ServiceTree";

const AppLockedMessage = function({ service }) {
  let itemType = "Service";

  if (service instanceof Pod) {
    itemType = "Pod";
  }

  if (service instanceof ServiceTree) {
    itemType = "Group";
  }

  return (
    <h4 className="text-align-center text-danger flush-top">
      {itemType}
      {" "}
      is currently locked by one or more deployments. Press the button
      again to forcefully change and deploy the new configuration.
    </h4>
  );
};

module.exports = AppLockedMessage;
