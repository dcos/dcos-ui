import * as React from "react";
import { Link } from "react-router";
import { MountService } from "foundation-ui";
import { Tooltip } from "@dcos/ui-kit";

import { Trans } from "@lingui/macro";

import ClusterHeader from "./ClusterHeader";
import SidebarToggle from "./SidebarToggle";
import Config from "../config/Config";

export default () => {
  const refreshRate = Config.getRefreshRate() / 1000;
  const refreshRateHint =
    Config.getRefreshRate() !== Config.defaultRefreshRate ? (
      <span>
        <Tooltip
          id="refreshRate"
          trigger={`Refresh Rate: ${refreshRate} sec`}
          maxWidth={150}
        >
          <Trans
            id="Data will only be requested every {refreshRate} seconds."
            values={{ refreshRate }}
          />
        </Tooltip>
      </span>
    ) : null;

  return (
    <div className="header-bar">
      <div className="header-bar-left-align-wrapper">
        <SidebarToggle />
        <Link to="/dashboard" className="header-bar-logo-wrapper">
          <span className="header-bar-logo" />
        </Link>
      </div>
      <div className="header-bar-right-align-wrapper">
        {refreshRateHint}
        <MountService.Mount type="Header:UserAccountDropdown" />
        <ClusterHeader />
      </div>
    </div>
  );
};
