import { Trans } from "@lingui/macro";

import * as React from "react";

import Pod from "../../structs/Pod";
import ServiceTree from "../../structs/ServiceTree";

const AppLockedMessage = ({ service }) => {
  let itemType = "Service";

  if (service instanceof Pod) {
    itemType = "Pod";
  }

  if (service instanceof ServiceTree) {
    itemType = "Group";
  }

  return (
    <Trans render="h4" className="text-align-center text-danger flush-top">
      {itemType} is currently locked by one or more deployments. Press the
      button again to forcefully change and deploy the new configuration.
    </Trans>
  );
};

export default AppLockedMessage;
