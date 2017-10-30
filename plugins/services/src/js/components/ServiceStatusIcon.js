import React, { Component } from "react";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";

import DateUtil from "#SRC/js/utils/DateUtil";
import StatusIcon from "#SRC/js/components/StatusIcon";
import StringUtil from "#SRC/js/utils/StringUtil";

import DeclinedOffersUtil from "../utils/DeclinedOffersUtil";
import ServiceStatusLabels from "../constants/ServiceStatusLabels";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

const UNABLE_TO_LAUNCH_TIMEOUT = 1000 * 60 * 30; // 30 minutes

class ServiceStatusIcon extends Component {
  getDeclinedOffersWarning(service) {
    if (DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(service)) {
      const timeWaiting =
        Date.now() -
        DateUtil.strToMs(DeclinedOffersUtil.getTimeWaiting(service.getQueue()));

      return this.getTooltip(
        `DC/OS has been waiting for resources and is unable to complete this deployment for ${DateUtil.getDuration(timeWaiting, null)}.`
      );
    }

    return null;
  }

  getServiceTreeWarning(service) {
    const appsWithWarningsCount = service
      .filterItems(item => {
        if (!(item instanceof ServiceTree)) {
          return (
            DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(item) ||
            this.shouldShowUnableToLaunchWarning(item)
          );
        }

        return false;
      })
      .flattenItems()
      .getItems().length;

    if (appsWithWarningsCount > 0) {
      return this.getTooltip(
        `DC/OS is waiting for resources and is unable to complete the deployment of ${appsWithWarningsCount} ${StringUtil.pluralize("service", appsWithWarningsCount)} in this group.`
      );
    }

    return null;
  }

  getTooltip(content) {
    const { service } = this.props;
    let icon = <StatusIcon state="WARNING" />;

    if (service instanceof Service) {
      const servicePath = encodeURIComponent(service.getId());
      icon = <Link to={`/services/detail/${servicePath}/debug`}>{icon}</Link>;
    }

    return (
      <Tooltip
        content={content}
        width={250}
        wrapText={true}
        wrapperClassName="tooltip-wrapper"
      >
        {icon}
      </Tooltip>
    );
  }

  getUnableToLaunchWarning(service) {
    if (this.shouldShowUnableToLaunchWarning(service)) {
      return this.getTooltip(
        `DC/OS has been unable to complete this deployment for ${DateUtil.getDuration(Date.now() - DateUtil.strToMs(service.getQueue().since), null)}.`
      );
    }

    return null;
  }

  shouldShowUnableToLaunchWarning(service) {
    const queue = service.getQueue();

    if (queue == null) {
      return false;
    }

    return (
      Date.now() - DateUtil.strToMs(queue.since) >= UNABLE_TO_LAUNCH_TIMEOUT
    );
  }

  render() {
    const { service } = this.props;
    const displayName = service.getServiceStatus().displayName;
    let iconState = displayName;

    if (
      displayName === ServiceStatusLabels.DEPLOYING ||
      displayName === ServiceStatusLabels.RECOVERING ||
      displayName === ServiceStatusLabels.DELETING
    ) {
      iconState = "TRANSITION";
    }

    iconState = iconState.toUpperCase();

    if (service instanceof ServiceTree) {
      return (
        this.getServiceTreeWarning(service) || <StatusIcon state={iconState} />
      );
    }

    // Display the declined offers warning if that's causing a delay. If not,
    // we try to display an unable to launch warning, then default to nothing.
    return (
      this.getDeclinedOffersWarning(service) ||
      this.getUnableToLaunchWarning(service) ||
      <StatusIcon state={iconState} />
    );
  }
}

ServiceStatusIcon.propTypes = {
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Service),
    React.PropTypes.instanceOf(ServiceTree),
    React.PropTypes.instanceOf(Pod)
  ])
};

module.exports = ServiceStatusIcon;
