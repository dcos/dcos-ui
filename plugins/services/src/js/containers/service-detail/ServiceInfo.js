import classNames from "classnames";
import { Dropdown } from "reactjs-components";
import React from "react";

import DetailViewHeader
  from "../../../../../../src/js/components/DetailViewHeader";
import HealthBar from "../../components/HealthBar";
import Service from "../../structs/Service";
import ServiceActionItem from "../../constants/ServiceActionItem";
import StatusMapping from "../../constants/StatusMapping";
import StringUtil from "../../../../../../src/js/utils/StringUtil";

class ServiceInfo extends React.Component {
  getActionButtons() {
    const { service } = this.props;

    const dropdownItems = [
      {
        className: "hidden",
        id: ServiceActionItem.MORE,
        html: "",
        selectedHtml: "More"
      },
      {
        className: classNames({
          hidden: service.getInstancesCount() === 0
        }),
        id: ServiceActionItem.RESTART,
        html: "Restart"
      },
      {
        className: classNames({
          hidden: service.getInstancesCount() === 0
        }),
        id: ServiceActionItem.SUSPEND,
        html: "Suspend"
      },
      {
        id: ServiceActionItem.DESTROY,
        html: <span className="text-danger">Destroy</span>
      }
    ];

    const actionButtons = [
      <button
        className="button flush-bottom button-primary"
        key="action-button-scale"
        onClick={() =>
          this.props.onActionsItemSelection({ id: ServiceActionItem.SCALE })}
      >
        Scale
      </button>,
      <button
        className="button flush-bottom button-stroke"
        key="action-button-edit"
        onClick={() =>
          this.props.onActionsItemSelection({ id: ServiceActionItem.EDIT })}
      >
        Edit
      </button>,
      <Dropdown
        key="actions-dropdown"
        anchorRight={true}
        buttonClassName="button button-stroke dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown flush-bottom"
        items={dropdownItems}
        persistentID={ServiceActionItem.MORE}
        onItemSelection={this.props.onActionsItemSelection}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
      />
    ];

    const webURL = service.getWebURL();
    if (webURL) {
      actionButtons.unshift(
        <a
          className="button button-primary flush-bottom"
          key="service-link"
          href={webURL}
          target="_blank"
          title="Open in a new window"
        >
          Open Service
        </a>
      );
    }

    return actionButtons;
  }

  getSubHeader(service) {
    const serviceHealth = service.getHealth();
    const serviceStatus = service.getStatus();
    const tasksSummary = service.getTasksSummary();
    const serviceStatusClassSet = StatusMapping[serviceStatus] || "";
    const runningTasksCount = tasksSummary.tasksRunning;
    const instancesCount = service.getInstancesCount();
    const runningTasksSubHeader = StringUtil.pluralize(
      "Instance",
      runningTasksCount
    );
    let overCapacity = "";
    const isDeploying = serviceStatus === "Deploying";

    if (tasksSummary.tasksOverCapacity > 0) {
      overCapacity = ` (over capacity by ${tasksSummary.tasksOverCapacity} tasks)`;
    }

    const subHeaderItems = [
      {
        classes: `media-object-item ${serviceStatusClassSet}`,
        label: serviceStatus,
        shouldShow: serviceHealth.key != null
      },
      {
        classes: "media-object-item",
        label: `${runningTasksCount} ${runningTasksSubHeader}` + overCapacity,
        shouldShow: runningTasksCount != null && runningTasksSubHeader != null
      },
      {
        label: (
          <HealthBar
            isDeploying={isDeploying}
            tasksSummary={tasksSummary}
            instancesCount={instancesCount}
          />
        ),
        shouldShow: true
      }
    ].map(function(item, index) {
      if (!item.shouldShow) {
        return null;
      }

      return (
        <span className={item.classes} key={index}>
          {item.label}
        </span>
      );
    });

    return (
      <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
        <div className="media-object">
          {subHeaderItems}
        </div>
      </div>
    );
  }

  render() {
    const service = this.props.service;
    let serviceIcon = null;
    const serviceImages = service.getImages();
    if (serviceImages && serviceImages["icon-large"]) {
      serviceIcon = <img src={serviceImages["icon-large"]} />;
    }

    const tabs = (
      <ul className="menu-tabbed">
        {this.props.tabs}
      </ul>
    );

    return (
      <DetailViewHeader
        actionButtons={this.getActionButtons()}
        icon={serviceIcon}
        iconClassName="icon-image-container icon-app-container"
        subTitle={this.getSubHeader(service)}
        navigationTabs={tabs}
        title={service.getName()}
      />
    );
  }
}

ServiceInfo.propTypes = {
  onActionsItemSelection: React.PropTypes.func.isRequired,
  service: React.PropTypes.instanceOf(Service).isRequired,
  tabs: React.PropTypes.array
};

module.exports = ServiceInfo;
