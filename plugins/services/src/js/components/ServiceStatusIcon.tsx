import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DateUtil from "#SRC/js/utils/DateUtil";
import StatusIcon from "#SRC/js/constants/StatusIcon";
import StringUtil from "#SRC/js/utils/StringUtil";

// @ts-ignore
import DeclinedOffersUtil from "../utils/DeclinedOffersUtil";
import * as ServiceStatus from "../constants/ServiceStatus";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

const UNABLE_TO_LAUNCH_TIMEOUT = 1000 * 60 * 30; // 30 minutes

const getTooltipContent = (service: Service | Pod, content: JSX.Element) => {
  const servicePath = encodeURIComponent(service.getId());

  return (
    <span>
      {content}{" "}
      <a
        href={`#/services/detail/${servicePath}/debug`}
        title="debug information"
      >
        <Trans render="span">Debug information</Trans>
      </a>
    </span>
  );
};

type TreeNode = Service | ServiceTree | Pod;

class ServiceStatusIcon extends React.Component<{
  showTooltip?: boolean;
  tooltipContent: React.ReactNode;
  service: TreeNode;
}> {
  static propTypes = {
    showTooltip: PropTypes.bool,
    tooltipContent: PropTypes.node,
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(Service),
      PropTypes.instanceOf(ServiceTree),
      PropTypes.instanceOf(Pod)
    ])
  };

  getDeclinedOffersWarning(service: TreeNode) {
    if (DeclinedOffersUtil.displayDeclinedOffersWarning(service)) {
      const timeWaiting =
        Date.now() -
        DateUtil.strToMs(DeclinedOffersUtil.getTimeWaiting(
          service.getQueue()
        ) as string);

      return this.getTooltip(
        <Trans render="span">
          DC/OS has been waiting for resources and is unable to complete this
          deployment for {DateUtil.getDuration(timeWaiting)}.
        </Trans>
      );
    }

    return null;
  }

  getServiceTreeWarning(serviceTree: ServiceTree) {
    const appsWithWarningsCount = serviceTree
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

    // L10NTODO: Pluralize
    if (appsWithWarningsCount > 0) {
      return this.getTooltip(
        <Trans render="span">
          DC/OS is waiting for resources and is unable to complete the
          deployment of {appsWithWarningsCount}{" "}
          {StringUtil.pluralize("service", appsWithWarningsCount)} in this
          group.
        </Trans>
      );
    }

    return null;
  }

  getTooltip(content: JSX.Element) {
    const { service } = this.props;
    let icon = (
      <Icon
        shape={StatusIcon.WARNING.shape}
        color={StatusIcon.WARNING.color}
        size={iconSizeXs}
      />
    );

    if (service instanceof Service) {
      const servicePath = encodeURIComponent(service.getId());
      content = getTooltipContent(service, content);
      icon = <Link to={`/services/detail/${servicePath}/debug`}>{icon}</Link>;
    }

    return (
      <Tooltip
        interactive={true}
        content={content}
        wrapText={true}
        wrapperClassName="tooltip-wrapper"
      >
        {icon}
      </Tooltip>
    );
  }

  getUnableToLaunchWarning(service: Service | Pod) {
    const duration = DateUtil.getDuration(
      Date.now() - DateUtil.strToMs((service.getQueue() as any).since as string)
    );

    return this.getTooltip(
      <Trans render="span">
        There are tasks in this queue that DC/OS has failed to deploy for
        {duration}.
      </Trans>
    );
  }

  isUnableToLaunch(service: TreeNode) {
    const queue: any = service.getQueue();

    if (queue == null) {
      return false;
    }

    return (
      Date.now() - (DateUtil.strToMs(queue.since) as number) >=
      UNABLE_TO_LAUNCH_TIMEOUT
    );
  }

  renderIcon(iconState: StatusIcon) {
    const icon = (
      <Icon shape={iconState.shape} color={iconState.color} size={iconSizeXs} />
    );

    if (this.props.showTooltip) {
      return (
        <Tooltip
          interactive={true}
          content={this.props.tooltipContent}
          wrapText={true}
          wrapperClassName="tooltip-wrapper"
        >
          {icon}
        </Tooltip>
      );
    }

    return icon;
  }

  render() {
    const { service } = this.props;
    const iconState = ServiceStatus.toIcon(service.getServiceStatus());

    // Catch other cases instead throwing a warning/error
    if (iconState == null) {
      return null;
    }

    if (service instanceof ServiceTree) {
      return this.getServiceTreeWarning(service) || this.renderIcon(iconState);
    }

    // Display the declined offers warning if that's causing a delay.
    if (DeclinedOffersUtil.displayDeclinedOffersWarning(service)) {
      return this.getDeclinedOffersWarning(service);
    }

    // If not, we try to display an unable to launch warning, then default to nothing.
    if (this.isUnableToLaunch(service)) {
      return this.getUnableToLaunchWarning(service);
    }

    return this.renderIcon(iconState);
  }
}

export default ServiceStatusIcon;
