import classNames from "classnames/dedupe";
import { Dropdown } from "reactjs-components";
import React from "react";

import DetailViewHeader
  from "../../../../../../src/js/components/DetailViewHeader";
import HealthBar from "../../components/HealthBar";
import Pod from "../../structs/Pod";
import ServiceStatus from "../../constants/ServiceStatus";
import StatusMapping from "../../constants/StatusMapping";
import PodActionItem from "../../constants/PodActionItem";
import StringUtil from "../../../../../../src/js/utils/StringUtil";

const METHODS_TO_BIND = ["handleDropdownAction"];

class PodHeader extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getActionButtons() {
    var { pod } = this.props;

    const dropdownItems = [
      // This item is used as a label to the dropdown
      {
        className: "hidden",
        id: "__MORE__",
        html: "",
        selectedHtml: "More"
      },
      {
        className: classNames({
          hidden: pod.getInstancesCount() === 0
        }),
        id: PodActionItem.SUSPEND,
        html: "Suspend"
      },
      {
        id: PodActionItem.DESTROY,
        html: <span className="text-danger">Destroy</span>
      }
    ];

    const actionButtons = [
      <button
        className="button flush-bottom  button-primary"
        key="action-button-scale"
        onClick={this.props.onScale}
      >
        Scale
      </button>,
      <button
        className="button flush-bottom button-stroke"
        key="action-button-edit"
        onClick={this.props.onEdit}
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
        persistentID="__MORE__"
        onItemSelection={this.handleDropdownAction}
        transition={true}
        transitionName="dropdown-menu"
      />
    ];

    return actionButtons;
  }

  handleDropdownAction(action) {
    switch (action.id) {
      case PodActionItem.SUSPEND:
        this.props.onSuspend();
        break;

      case PodActionItem.DESTROY:
        this.props.onDestroy();
        break;
    }
  }

  getSubHeader(pod) {
    const serviceHealth = pod.getHealth();
    const serviceStatus = pod.getServiceStatus();
    const tasksSummary = pod.getTasksSummary();
    const serviceStatusClassSet =
      StatusMapping[serviceStatus.displayName] || "";
    const runningTasksCount = tasksSummary.tasksRunning;
    const instancesCount = pod.getInstancesCount();
    const runningTasksSubHeader = StringUtil.pluralize(
      "Instance",
      runningTasksCount
    );
    const subHeaderItems = [
      {
        classes: `media-object-item ${serviceStatusClassSet}`,
        label: serviceStatus.displayName,
        shouldShow: serviceHealth.key != null
      },
      {
        classes: "media-object-item",
        label: `${runningTasksCount} ${runningTasksSubHeader}`,
        shouldShow: runningTasksCount != null && runningTasksSubHeader != null
      },
      {
        label: (
          <HealthBar
            tasksSummary={tasksSummary}
            isDeploying={serviceStatus === ServiceStatus.DEPLOYING}
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
        {subHeaderItems}
      </div>
    );
  }

  render() {
    const pod = this.props.pod;
    let podIcon = null;
    const podImages = pod.getImages();
    if (podImages && podImages["icon-large"]) {
      podIcon = <img src={podImages["icon-large"]} />;
    }

    const tabs = (
      <ul className="menu-tabbed">
        {this.props.tabs}
      </ul>
    );

    return (
      <DetailViewHeader
        actionButtons={this.getActionButtons()}
        icon={podIcon}
        iconClassName="icon-image-container icon-app-container"
        subTitle={this.getSubHeader(pod)}
        navigationTabs={tabs}
        title={pod.getName()}
      />
    );
  }
}

PodHeader.defaultProps = {
  onDestroy() {},
  onEdit() {},
  onScale() {},
  onSuspend() {},
  pod: null,
  tabs: []
};

PodHeader.propTypes = {
  onDestroy: React.PropTypes.func,
  onEdit: React.PropTypes.func,
  onScale: React.PropTypes.func,
  onSuspend: React.PropTypes.func,
  pod: React.PropTypes.instanceOf(Pod).isRequired,
  tabs: React.PropTypes.array
};

module.exports = PodHeader;
