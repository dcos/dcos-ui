import { Trans } from "@lingui/macro";
import classNames from "classnames/dedupe";
import { Dropdown } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";

import DetailViewHeader from "#SRC/js/components/DetailViewHeader";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import ServiceStatusProgressBar from "../../components/ServiceStatusProgressBar";
import Pod from "../../structs/Pod";
import StatusMapping from "../../constants/StatusMapping";
import PodActionItem from "../../constants/PodActionItem";

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
        id: PodActionItem.STOP,
        html: "Stop"
      },
      {
        id: PodActionItem.DELETE,
        html: (
          <span className="text-danger">
            {StringUtil.capitalize(UserActions.DELETE)}
          </span>
        )
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
        className="button flush-bottom button-outline"
        key="action-button-edit"
        onClick={this.props.onEdit}
      >
        Edit
      </button>,
      <Dropdown
        key="actions-dropdown"
        anchorRight={true}
        buttonClassName="button button-outline dropdown-toggle"
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
      case PodActionItem.STOP:
        this.props.onStop();
        break;

      case PodActionItem.DELETE:
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
    const runningTasksSubHeader = StringUtil.pluralize(
      "Instance",
      runningTasksCount
    );
    const subHeaderItems = [
      {
        classes: `media-object-item ${serviceStatusClassSet}`,
        label: <Trans id={serviceStatus.displayName} />,
        shouldShow: serviceHealth.key != null
      },
      {
        classes: "media-object-item",
        label: `${runningTasksCount} ${runningTasksSubHeader}`,
        shouldShow: runningTasksCount != null && runningTasksSubHeader != null
      },
      {
        label: <ServiceStatusProgressBar service={pod} />,
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

    const tabs = <ul className="menu-tabbed">{this.props.tabs}</ul>;

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
  onStop() {},
  pod: null,
  tabs: []
};

PodHeader.propTypes = {
  onDestroy: PropTypes.func,
  onEdit: PropTypes.func,
  onScale: PropTypes.func,
  onStop: PropTypes.func,
  pod: PropTypes.instanceOf(Pod).isRequired,
  tabs: PropTypes.array
};

module.exports = PodHeader;
