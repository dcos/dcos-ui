import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import DateUtil from "../../../../../src/js/utils/DateUtil";
import DeclinedOffersUtil from "../utils/DeclinedOffersUtil";
import Icon from "../../../../../src/js/components/Icon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import StringUtil from "../../../../../src/js/utils/StringUtil";

const UNABLE_TO_LAUNCH_TIMEOUT = 1000 * 60 * 30; // 30 minutes

class ServiceStatusWarning extends Component {
  getDeclinedOffersWarning(item) {
    if (DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(item)) {
      const timeWaiting =
        Date.now() -
        DateUtil.strToMs(DeclinedOffersUtil.getTimeWaiting(item.getQueue()));

      return this.getTooltip(
        `DC/OS has been waiting for resources and is unable to complete this deployment for ${DateUtil.getDuration(timeWaiting, null)}.`
      );
    }

    return null;
  }

  getServiceTreeWarning(item) {
    const appsWithWarningsCount = item
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

    return <noscript />;
  }

  getTooltip(content) {
    return (
      <Tooltip
        content={content}
        width={250}
        wrapText={true}
        wrapperClassName="tooltip-wrapper status-waiting-indicator"
      >
        <Icon color="red" id="yield" size="mini" />
      </Tooltip>
    );
  }

  getUnableToLaunchWarning(item) {
    if (this.shouldShowUnableToLaunchWarning(item)) {
      return this.getTooltip(
        `DC/OS has been unable to complete this deployment for ${DateUtil.getDuration(Date.now() - DateUtil.strToMs(item.getQueue().since), null)}.`
      );
    }

    return null;
  }

  shouldShowUnableToLaunchWarning(item) {
    const queue = item.getQueue();

    if (queue == null) {
      return false;
    }

    return (
      Date.now() - DateUtil.strToMs(queue.since) >= UNABLE_TO_LAUNCH_TIMEOUT
    );
  }

  render() {
    const { item } = this.props;

    if (item instanceof ServiceTree) {
      return this.getServiceTreeWarning(item);
    }

    // Display the declined offers warning if that's causing a delay. If not,
    // we try to display an unable to launch warning, then default to nothing.
    return (
      this.getDeclinedOffersWarning(item) ||
      this.getUnableToLaunchWarning(item) ||
      <noscript />
    );
  }
}

ServiceStatusWarning.propTypes = {
  item: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Service),
    React.PropTypes.instanceOf(ServiceTree),
    React.PropTypes.instanceOf(Pod)
  ])
};

module.exports = ServiceStatusWarning;
