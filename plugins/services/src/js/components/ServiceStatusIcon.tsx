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

const getTooltipContent = (id: string, content: JSX.Element) => {
  const servicePath = encodeURIComponent(id);

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

class ServiceStatusIcon extends React.Component<{
  showTooltip?: boolean;
  tooltipContent: React.ReactNode;
  id: string | number;
  isService: boolean;
  isServiceTree: boolean;
  serviceStatus: any;
  timeWaiting: string | null;
  timeQueued: number | null;
  appsWithWarnings: number | null;
  displayDeclinedOffers: boolean;
  unableToLaunch: boolean;
}> {
  static propTypes = {
    showTooltip: PropTypes.bool,
    tooltipContent: PropTypes.node,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isService: PropTypes.bool,
    isServiceTree: PropTypes.bool,
    serviceStatus: PropTypes.object,
    timeWaiting: PropTypes.string,
    timeQueued: PropTypes.number,
    appsWithWarnings: PropTypes.number,
    displayDeclinedOffers: PropTypes.bool,
    unableToLaunch: PropTypes.bool
  };

  getDeclinedOffersWarning() {
    const { displayDeclinedOffers, timeWaiting } = this.props;
    if (displayDeclinedOffers) {
      const waitDuration = Date.now() - (DateUtil.strToMs(timeWaiting) || 0);

      return this.getTooltip(
        <Trans render="span">
          DC/OS has been waiting for resources and is unable to complete this
          deployment for {DateUtil.getDuration(waitDuration)}.
        </Trans>
      );
    }

    return null;
  }

  getServiceTreeWarning() {
    const { appsWithWarnings } = this.props;

    // L10NTODO: Pluralize
    if (appsWithWarnings != null && appsWithWarnings > 0) {
      return this.getTooltip(
        <Trans render="span">
          DC/OS is waiting for resources and is unable to complete the
          deployment of {appsWithWarnings}{" "}
          {StringUtil.pluralize("service", appsWithWarnings)} in this group.
        </Trans>
      );
    }

    return null;
  }

  getTooltip(content: JSX.Element) {
    let icon = (
      <Icon
        shape={StatusIcon.WARNING.shape}
        color={StatusIcon.WARNING.color}
        size={iconSizeXs}
      />
    );
    const { id, isService } = this.props;

    if (isService) {
      const servicePath = encodeURIComponent(`${id}`);
      content = getTooltipContent(`${id}`, content);
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

  getUnableToLaunchWarning() {
    const { unableToLaunch, timeQueued } = this.props;
    const duration = DateUtil.getDuration(Date.now() - (timeQueued || 0));
    if (unableToLaunch) {
      return this.getTooltip(
        <Trans render="span">
          There are tasks in this queue that DC/OS has failed to deploy for{" "}
          {duration}.
        </Trans>
      );
    }

    return null;
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
    const {
      serviceStatus,
      isServiceTree,
      displayDeclinedOffers,
      unableToLaunch
    } = this.props;
    const iconState = ServiceStatus.toIcon(serviceStatus);

    // Catch other cases instead throwing a warning/error
    if (iconState == null) {
      return null;
    }

    if (isServiceTree) {
      return this.getServiceTreeWarning() || this.renderIcon(iconState);
    }

    // Display the declined offers warning if that's causing a delay.
    if (displayDeclinedOffers) {
      return this.getDeclinedOffersWarning();
    }

    // If not, we try to display an unable to launch warning, then default to nothing.
    if (unableToLaunch) {
      return this.getUnableToLaunchWarning();
    }

    return this.renderIcon(iconState);
  }
}

export default ServiceStatusIcon;
