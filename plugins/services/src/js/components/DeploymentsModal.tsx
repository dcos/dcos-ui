import { i18nMark, withI18n, Trans } from "@lingui/react";
import classNames from "classnames";
import { Confirm, Dropdown, Modal } from "reactjs-components";
import { hashHistory } from "react-router";
import mixin from "reactjs-mixin";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import CollapsingString from "#SRC/js/components/CollapsingString";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import ExpandingTable from "#SRC/js/components/ExpandingTable";
import Image from "#SRC/js/components/Image";
import Loader from "#SRC/js/components/Loader";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import ServiceUtil from "#PLUGINS/services/src/js/utils/ServiceUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import TimeAgo from "#SRC/js/components/TimeAgo";
import TableUtil from "#SRC/js/utils/TableUtil";

import defaultServiceImage from "../../img/icon-service-default-small@2x.png";
import MarathonActions from "../events/MarathonActions";

const columnClasses = {
  id: "deployments-table-column-id",
  startTime: "deployments-table-column-start-time",
  status: "deployments-table-column-status",
  action: "deployments-table-column-actions"
};
const columnHeadings = ResourceTableUtil.renderHeading({
  id: i18nMark("Affected Services"),
  version: i18nMark("Started"),
  status: i18nMark("Status"),
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
  constructor(...args) {
    super(...args);

    this.state = {
      dcosServiceDataReceived: false,
      dcosDeploymentsList: []
    };
    this.store_listeners = [
      { name: "dcos", events: ["change"], suppressUpdate: true },
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

  onDcosStoreChange() {
    this.setState({
      dcosDeploymentsList: DCOSStore.deploymentsList.getItems(),
      dcosServiceDataReceived: DCOSStore.serviceDataReceived
    });
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
    }
  }

  getChildTableData(deployment) {
    return [
      ...deployment.getAffectedServices().map(service => {
        service.deployment = deployment;
        service.isStale = false;

        return service;
      }),
      ...deployment.getStaleServiceIds().map(serviceID => ({
        deployment,
        serviceID,
        isStale: true
      }))
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
    const sortFunction = TableUtil.getSortFunction(
      "id",
      (item, prop) => item[prop]
    );

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
        prop: "version",
        render: this.renderStartTime,
        sortable: true,
        sortFunction
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
      .map(service => StringUtil.capitalize(service.getName()));
    const listOfServiceNames = StringUtil.humanizeArray(serviceNames);
    const serviceCount = serviceNames.length;

    // L10NTODO: Pluralize
    if (deploymentToRollback.isStarting()) {
      if (serviceCount === 1) {
        return (
          <Trans
            render="p"
            id="This will stop the current deployment of {listOfServiceNames} and start a new deployment to delete the affected service."
            values={{ listOfServiceNames }}
          />
        );
      } else {
        return (
          <Trans
            render="p"
            id="This will stop the current deployment of {listOfServiceNames} and start a new deployment to delete the affected services."
            values={{ listOfServiceNames }}
          />
        );
      }
    }

    // L10NTODO: Pluralize
    if (serviceCount === 1) {
      return (
        <Trans
          render="p"
          id="This will stop the current deployment of {listOfServiceNames} and start a new deployment to revert the affected service to its previous version."
          values={{ listOfServiceNames }}
        />
      );
    } else {
      return (
        <Trans
          render="p"
          id="This will stop the current deployment of {listOfServiceNames} and start a new deployment to revert the affected services to their previous versions."
          values={{ listOfServiceNames }}
        />
      );
    }
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
        {`Services${servicePath}`}
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
    const { i18n } = this.props;

    const doesDeploymentContainSDKService = children.some(service =>
      ServiceUtil.isSDKService(service)
    );

    if (
      !doesDeploymentContainSDKService &&
      rowOptions.isParent &&
      deployment != null
    ) {
      let actionText = i18nMark("Rollback");
      if (deployment.isStarting()) {
        actionText = i18nMark("Rollback & Delete");
      }

      const dropdownItems = [
        {
          className: "hidden",
          id: "default",
          html: "",
          selectedHtml: (
            <Icon shape={SystemIcons.EllipsisVertical} size={iconSizeXs} />
          )
        },
        {
          id: "rollback",
          html: <Trans id={actionText} render="span" className="text-danger" />
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
          title={i18n._(/*i18n*/ { id: "More actions" })}
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
            <span className="table-cell-value">{item.serviceID}</span>
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
            <span className="table-cell-value">{item.getName()}</span>
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
        <AlertPanelHeader>
          <Trans render="span" id="No active deployments" />
        </AlertPanelHeader>
        <Trans
          render="p"
          className="flush"
          id="Active deployments will be shown here."
        />
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
    const { i18n } = this.props;

    const heading = (
      <ModalHeading>
        <Trans render="span" id="Are you sure?" />
      </ModalHeading>
    );

    const rollbackActionText = awaitingRevertDeploymentResponse
      ? i18n._(/*i18n*/ { id: "Rolling back..." })
      : i18n._(/*i18n*/ { id: "Continue Rollback" });

    if (deploymentToRollback != null) {
      return (
        <Confirm
          closeByBackdropClick={true}
          disabled={awaitingRevertDeploymentResponse}
          header={heading}
          onClose={this.handleRollbackCancel}
          leftButtonCallback={this.handleRollbackCancel}
          leftButtonText={i18n._(/*i18n*/ { id: "Cancel" })}
          leftButtonClassName="button button-primary-link"
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleRollbackConfirm}
          rightButtonText={rollbackActionText}
          showHeader={true}
        >
          <div className="text-align-center">
            {this.getRollbackModalText(deploymentToRollback)}
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
      currentActions = item.deployment.currentActions.reduce((memo, action) => {
        memo[action.app] = action.action;

        return memo;
      }, {});
    }

    let statusText = !item.isStale && item.getStatus ? item.getStatus() : null;
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
    if (typeof deploymentRollbackError === "string") {
      return (
        <p className="text-error-state flush-bottom">
          {deploymentRollbackError}
        </p>
      );
    }
  }

  render() {
    let content = null;
    const deployments = this.state.dcosDeploymentsList;
    const { isOpen, onClose } = this.props;
    const loading = !this.state.dcosServiceDataReceived;

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
          <Trans render="span" id="Close" />
        </button>
      </div>
    );

    // L10NTODO: Pluralize
    const deploymentsCount = deployments.length;
    const deploymentsText =
      deploymentsCount === 1 ? i18nMark("Deployment") : i18nMark("Deployments");
    const heading = !loading ? (
      <ModalHeading>
        {deploymentsCount} <Trans render="span" id="Active" />{" "}
        <Trans render="span" id={deploymentsText} />
      </ModalHeading>
    ) : null;

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

export default withI18n()(DeploymentsModal);
export const WrappedComponent = DeploymentsModal;
