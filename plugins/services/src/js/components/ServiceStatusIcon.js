import React, { Component } from "react";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import DateUtil from "#SRC/js/utils/DateUtil";
import StatusIcon from "#SRC/js/constants/StatusIcon";
import StringUtil from "#SRC/js/utils/StringUtil";

import DeclinedOffersUtil from "../utils/DeclinedOffersUtil";
import ServiceStatus from "../constants/ServiceStatus";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

const UNABLE_TO_LAUNCH_TIMEOUT = 1000 * 60 * 30; // 30 minutes

const getTooltipContent = (service, content) => {
  const servicePath = encodeURIComponent(service.getId());

  return (
    <span>
      {`${content} `}
      <a
        href={`#/services/detail/${servicePath}/debug`}
        title="debug information"
      >
        Debug information
      </a>
    </span>
  );
};

class ServiceStatusIcon extends Component {
  getDeclinedOffersWarning(service) {
    if (DeclinedOffersUtil.displayDeclinedOffersWarning(service)) {
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
            DeclinedOffersUtil.displayDeclinedOffersWarning(item) ||
            this.isUnableToLaunch(item)
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
    let icon = <Icon {...StatusIcon.WARNING} size="mini" />;

    if (service instanceof Service) {
      const servicePath = encodeURIComponent(service.getId());
      content = getTooltipContent(service, content);
      icon = <Link to={`/services/detail/${servicePath}/debug`}>{icon}</Link>;
    }

    return (
      <Tooltip
        interactive={true}
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
    if (this.isUnableToLaunch(service)) {
      return this.getTooltip(
        `DC/OS has been unable to complete this deployment for ${DateUtil.getDuration(Date.now() - DateUtil.strToMs(service.getQueue().since), null)}.`
      );
    }

    return null;
  }

  isUnableToLaunch(service) {
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
    const serviceStatus = service.getServiceStatus();
    let iconState;

    if (serviceStatus === ServiceStatus.RUNNING) {
      iconState = StatusIcon.SUCCESS;
    }

    if (
      serviceStatus === ServiceStatus.DEPLOYING ||
      serviceStatus === ServiceStatus.RECOVERING ||
      serviceStatus === ServiceStatus.DELETING
    ) {
      iconState = StatusIcon.LOADING;
    }

    if (serviceStatus === ServiceStatus.WARNING) {
      iconState = StatusIcon.WARNING;
    }

    if (serviceStatus === ServiceStatus.STOPPED) {
      iconState = StatusIcon.STOPPED;
    }

    // Catch other cases instead throwing a warning/error
    if (iconState == null) {
      return null;
    }

    if (service instanceof ServiceTree) {
      return (
        this.getServiceTreeWarning(service) ||
        <Icon {...iconState} size="mini" />
      );
    }

    // Display the declined offers warning if that's causing a delay.
    if (DeclinedOffersUtil.displayDeclinedOffersWarning(service)) {
      return this.getDeclinedOffersWarning(service);
    }

    // If not, we try to display an unable to launch warning, then default to nothing.
    if (this.isUnableToLaunch(service)) {
      return this.getUnableToLaunchWarning(service);
    }

    if (this.props.showTooltip) {
      return (
        <Tooltip
          interactive={true}
          content={this.props.tooltipContent}
          width={250}
          wrapText={true}
          wrapperClassName="tooltip-wrapper"
        >
          <Icon {...iconState} size="mini" />
        </Tooltip>
      );
    }

    return <Icon {...iconState} size="mini" />;
  }
}

ServiceStatusIcon.propTypes = {
  showTooltip: React.PropTypes.bool,
  tooltipContent: React.PropTypes.string,
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Service),
    React.PropTypes.instanceOf(ServiceTree),
    React.PropTypes.instanceOf(Pod)
  ])
};

module.exports = ServiceStatusIcon;
