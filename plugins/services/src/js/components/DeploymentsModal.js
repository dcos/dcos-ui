import classNames from "classnames";
import { Confirm, Dropdown, Modal } from "reactjs-components";
import { hashHistory } from "react-router";
import { injectIntl } from "react-intl";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import CollapsingString from "#SRC/js/components/CollapsingString";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import ExpandingTable from "#SRC/js/components/ExpandingTable";
import Icon from "#SRC/js/components/Icon";
import Image from "#SRC/js/components/Image";
import Loader from "#SRC/js/components/Loader";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import ServiceUtil from "#SRC/js/utils/ServiceUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";
import StringUtil from "#SRC/js/utils/StringUtil";
import TimeAgo from "#SRC/js/components/TimeAgo";
import UserActions from "#SRC/js/constants/UserActions";

import defaultServiceImage from "../../img/icon-service-default-small@2x.png";
import MarathonActions from "../events/MarathonActions";

const columnClasses = {
  id: "deployments-table-column-id",
  startTime: "deployments-table-column-start-time",
  status: "deployments-table-column-status",
  action: "deployments-table-column-actions"
};
const columnHeadings = ResourceTableUtil.renderHeading({
  id: "Affected Services",
  startTime: "Started",
  status: "Status",
  action: null
});
const METHODS_TO_BIND = [
  "renderAffectedServices",
  "renderStartTime",
  "renderStatus",
  "renderActionsMenu",
  "handleRollbackClick",
  "handleRollbackCancel",
  "handleRollbackConfirm",
  "onMarathonStoreDeploymentRollbackSuccess",
  "onMarathonStoreDeploymentRollbackError"
];

// collapsing columns are tightly coupled to the left-align caret property;
// this wrapper allows ordinary columns to collapse.
function columnClassNameGetter(prop, sortBy, row) {
  return classNames(
    columnClasses[prop],
    ResourceTableUtil.getClassName(prop, sortBy, row)
  );
}

class DeploymentsModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {};
    this.store_listeners = [
      { name: "dcos", events: ["change"], suppressUpdate: false },
      {
        name: "marathon",
        events: ["deploymentRollbackSuccess", "deploymentRollbackError"],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    }, this);
  }

  onMarathonStoreDeploymentRollbackSuccess(data) {
    const { deploymentToRollback } = this.state;
    if (
      deploymentToRollback != null &&
      deploymentToRollback.getId() === data.originalDeploymentID
    ) {
      this.setState({
        awaitingRevertDeploymentResponse: false,
        deploymentToRollback: null,
        deploymentRollbackError: null
      });
    }
  }

  onMarathonStoreDeploymentRollbackError(data) {
    const { deploymentToRollback } = this.state;
    if (
      deploymentToRollback != null &&
      deploymentToRollback.getId() === data.originalDeploymentID
    ) {
      this.setState({
        awaitingRevertDeploymentResponse: false,
        deploymentRollbackError: data.error
      });
    }
  }

  handleActionSelect(deployment, action) {
    if (action.id === "rollback") {
      this.handleRollbackClick(deployment);
    }
  }

  handleRollbackClick(deployment) {
    this.setState({ deploymentToRollback: deployment });
  }

  handleRollbackCancel() {
    this.setState({
      awaitingRevertDeploymentResponse: false,
      deploymentToRollback: null,
      deploymentRollbackError: null
    });
  }

  handleRollbackConfirm() {
    const { deploymentToRollback } = this.state;

    if (deploymentToRollback != null) {
      this.setState({ awaitingRevertDeploymentResponse: true });
      MarathonActions.revertDeployment(deploymentToRollback.getId());

      this.props.onClose();
    }
  }

  getChildTableData(deployment) {
    return [
      ...deployment.getAffectedServices().map(function(service) {
        service.deployment = deployment;
        service.isStale = false;

        return service;
      }),
      ...deployment.getStaleServiceIds().map(function(serviceID) {
        return {
          deployment,
          serviceID,
          isStale: true
        };
      })
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col className={columnClasses.id} />
        <col className={columnClasses.startTime} />
        <col className={columnClasses.status} />
        <col className={columnClasses.action} />
      </colgroup>
    );
  }

  getColumns() {
    return [
      {
        className: columnClassNameGetter,
        heading: columnHeadings,
        prop: "id",
        render: this.renderAffectedServices
      },
      {
        className: columnClassNameGetter,
        heading: columnHeadings,
        prop: "startTime",
        render: this.renderStartTime
      },
      {
        className: columnClassNameGetter,
        heading: columnHeadings,
        prop: "status",
        render: this.renderStatus
      },
      {
        className: columnClassNameGetter,
        heading: columnHeadings,
        prop: "action",
        render: this.renderActionsMenu,
        sortable: false
      }
    ];
  }

  getRollbackModalText(deploymentToRollback) {
    const serviceNames = deploymentToRollback
      .getAffectedServices()
      .map(function(service) {
        return StringUtil.capitalize(service.getName());
      });
    const listOfServiceNames = StringUtil.humanizeArray(serviceNames);
    const serviceCount = serviceNames.length;

    const service = StringUtil.pluralize("service", serviceCount);
    const its = serviceCount === 1 ? "its" : "their";
    const version = StringUtil.pluralize("version", serviceCount);

    if (deploymentToRollback.isStarting()) {
      return `This will stop the current deployment of ${listOfServiceNames} and
              start a new deployment to ${UserActions.DELETE} the affected
              ${service}.`;
    }

    return `This will stop the current deployment of ${listOfServiceNames} and
            start a new deployment to revert the affected ${service} to ${its}
            previous ${version}.`;
  }

  getServiceDisplayPath(service) {
    // Remove the service's name from the end of the path.
    const servicePath = service
      .getId()
      .replace(new RegExp(`/${service.getName()}$`), "");

    return (
      <a
        href={`#/services/overview/${encodeURIComponent(servicePath)}`}
        onClick={this.props.onClose}
      >
        {`services${servicePath}`}
      </a>
    );
  }

  getTableData(deploymentsItems) {
    return deploymentsItems.map(deployment => {
      deployment.children = this.getChildTableData(deployment);

      return deployment;
    });
  }

  renderActionsMenu(prop, deployment, rowOptions) {
    const { children = [] } = deployment;

    const doesDeploymentContainSDKService = children.some(function(service) {
      return ServiceUtil.isSDKService(service);
    });

    if (
      !doesDeploymentContainSDKService &&
      rowOptions.isParent &&
      deployment != null
    ) {
      let actionText = "Rollback";
      if (deployment.isStarting()) {
        actionText = `${actionText} & ${StringUtil.capitalize(UserActions.DELETE)}`;
      }

      const dropdownItems = [
        {
          className: "hidden",
          id: "default",
          html: "",
          selectedHtml: <Icon id="ellipsis-vertical" size="mini" />
        },
        {
          id: "rollback",
          html: (
            <span className="text-danger">
              {actionText}
            </span>
          )
        }
      ];

      return (
        <Dropdown
          anchorRight={true}
          buttonClassName="button button-mini button-link"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          wrapperClassName="dropdown flush-bottom table-cell-icon"
          items={dropdownItems}
          persistentID="default"
          onItemSelection={this.handleActionSelect.bind(this, deployment)}
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          title="More actions"
          transition={true}
          transitionName="dropdown-menu"
        />
      );
    }

    return null;
  }

  renderAffectedServices(prop, item, rowOptions) {
    // item is an instance of Deployment
    if (rowOptions.isParent) {
      let classes = null;

      if (item.children && item.children.length > 0) {
        classes = classNames("expanding-table-primary-cell is-expandable", {
          "is-expanded": rowOptions.isExpanded
        });
      }

      return (
        <div className={classes} onClick={rowOptions.clickHandler}>
          <CollapsingString string={item.getId()} />
        </div>
      );
    }

    if (item.isStale) {
      return (
        <div className="expanding-table-primary-cell-heading expanding-table-primary-cell-heading--no-nested-indicator">
          <div className="table-cell-flex-box" key={`stale_${item.serviceID}`}>
            <span className="icon icon-mini icon-image-container icon-app-container icon-margin-right deployment-service-icon">
              <Image src={defaultServiceImage} />
            </span>
            <span className="table-cell-value">
              {item.serviceID}
            </span>
          </div>
        </div>
      );
    }

    // item is an instance of Service
    const id = encodeURIComponent(item.getId());
    const image = item.getImages()["icon-small"];

    return (
      <div>
        <div className="expanding-table-primary-cell-heading expanding-table-primary-cell-heading--no-nested-indicator">
          <a
            className="deployment-service-name table-cell-link-primary table-cell-flex-box clickable"
            onClick={() => {
              hashHistory.push(`/services/detail/${id}`);
            }}
          >
            <span className="table-cell-icon icon icon-mini icon-image-container icon-margin-right icon-app-container deployment-service-icon">
              <Image fallbackSrc={defaultServiceImage} src={image} />
            </span>
            <span className="table-cell-value">
              {item.getName()}
            </span>
          </a>
        </div>
        <div className="deployment-service-path text-overflow">
          {this.getServiceDisplayPath(item)}
        </div>
      </div>
    );
  }

  renderEmpty() {
    return (
      <AlertPanel>
        <AlertPanelHeader>No active deployments</AlertPanelHeader>
        <p className="flush">Active deployments will be shown here.</p>
      </AlertPanel>
    );
  }

  renderLoading() {
    return <Loader />;
  }

  renderRollbackModal() {
    const {
      awaitingRevertDeploymentResponse,
      deploymentToRollback,
      deploymentRollbackError
    } = this.state;

    const heading = (
      <ModalHeading>
        Are you sure?
      </ModalHeading>
    );

    if (deploymentToRollback != null) {
      return (
        <Confirm
          closeByBackdropClick={true}
          disabled={awaitingRevertDeploymentResponse}
          header={heading}
          onClose={this.handleRollbackCancel}
          leftButtonCallback={this.handleRollbackCancel}
          leftButtonText="Cancel"
          leftButtonClassName="button button-primary-link"
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleRollbackConfirm}
          rightButtonText="Continue Rollback"
          showHeader={true}
        >
          <div className="text-align-center">
            <p>{this.getRollbackModalText(deploymentToRollback)}</p>
            {this.renderRollbackError(deploymentRollbackError)}
          </div>
        </Confirm>
      );
    }
  }

  renderStartTime(prop, deployment, rowOptions) {
    if (rowOptions.isParent) {
      return (
        <TimeAgo
          className="deployment-start-time"
          time={deployment.getStartTime()}
        />
      );
    }

    return null;
  }

  renderStatus(prop, item, rowOptions) {
    if (rowOptions.isParent) {
      const currentStep = item.getCurrentStep();
      const totalSteps = item.getTotalSteps();

      return this.renderProgressBar(currentStep, totalSteps);
    }

    let currentActions = {};
    if (
      item.deployment.currentActions &&
      item.deployment.currentActions.length > 0
    ) {
      currentActions = item.deployment.currentActions.reduce(function(
        memo,
        action
      ) {
        memo[action.app] = action.action;

        return memo;
      }, {});
    }

    let statusText = !item.isStale ? item.getStatus() : null;
    const itemId = item.isStale ? item.serviceID : item.id;

    if (currentActions[itemId] != null) {
      statusText = currentActions[itemId];
    }

    return statusText;
  }

  renderProgressBar(currentStep, totalSteps) {
    const data = [
      { className: "color-4", value: currentStep - 1 },
      { className: "staged", value: 1 },
      { className: "", value: totalSteps - currentStep }
    ];

    return <ProgressBar className="status-bar--large" data={data} />;
  }

  renderTable(deploymentsItems) {
    return (
      <div>
        <ExpandingTable
          childRowClassName="expanding-table-child"
          className="deployments-table expanding-table table table-hover table-flush table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.getTableData(deploymentsItems)}
          expandRowsByDefault={true}
        />
        {this.renderRollbackModal()}
      </div>
    );
  }

  renderRollbackError(deploymentRollbackError) {
    if (deploymentRollbackError != null) {
      return (
        <p className="text-error-state flush-bottom">
          {deploymentRollbackError}
        </p>
      );
    }
  }

  render() {
    let content = null;
    const deployments = DCOSStore.deploymentsList.getItems();
    const { intl, isOpen, onClose } = this.props;
    const loading = !DCOSStore.serviceDataReceived;

    if (loading) {
      content = this.renderLoading();
    } else if (deployments.length === 0) {
      content = this.renderEmpty();
    } else if (isOpen) {
      content = this.renderTable(deployments);
    }

    const footer = (
      <div className="text-align-center">
        <button className="button button-primary-link" onClick={onClose}>
          Close
        </button>
      </div>
    );
    const heading = (
      <ModalHeading>
        {intl.formatMessage(
          {
            id: "SERVICES.DEPLOYMENT_MODAL_HEADING"
          },
          {
            deploymentsCount: deployments.length
          }
        )}
      </ModalHeading>
    );

    return (
      <Modal
        modalClass="modal modal-large modal--deployments"
        footer={footer}
        header={heading}
        onClose={onClose}
        open={isOpen}
        showFooter={true}
        showHeader={true}
      >
        {content}
      </Modal>
    );
  }
}

module.exports = injectIntl(DeploymentsModal);
