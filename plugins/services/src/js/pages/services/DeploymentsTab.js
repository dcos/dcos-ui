import classNames from "classnames";
import { DCOSStore, ResourceTableUtil } from "foundation-ui";
import { Confirm, Table } from "reactjs-components";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import AlertPanel from "../../../../../../src/js/components/AlertPanel";
import AlertPanelHeader
  from "../../../../../../src/js/components/AlertPanelHeader";
import Breadcrumb from "../../../../../../src/js/components/Breadcrumb";
import BreadcrumbTextContent
  from "../../../../../../src/js/components/BreadcrumbTextContent";
import CollapsingString
  from "../../../../../../src/js/components/CollapsingString";
import defaultServiceImage
  from "../../../img/icon-service-default-small@2x.png";
import Loader from "../../../../../../src/js/components/Loader";
import MarathonActions from "../../events/MarathonActions";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import NestedServiceLinks
  from "../../../../../../src/js/components/NestedServiceLinks";
import Page from "../../../../../../src/js/components/Page";
import StatusBar from "../../../../../../src/js/components/StatusBar";
import StringUtil from "../../../../../../src/js/utils/StringUtil";
import TimeAgo from "../../../../../../src/js/components/TimeAgo";

const columnHeading = ResourceTableUtil.renderHeading({
  id: "AFFECTED SERVICES",
  startTime: "STARTED",
  location: "LOCATION",
  status: "STATUS",
  action: ""
});
const COLLAPSING_COLUMNS = ["location", "startTime", "action"];
const METHODS_TO_BIND = [
  "renderAffectedServices",
  "renderAffectedServicesList",
  "renderLocation",
  "renderStartTime",
  "renderStatus",
  "renderAction",
  "handleRollbackClick",
  "handleRollbackCancel",
  "handleRollbackConfirm",
  "onMarathonStoreDeploymentRollbackSuccess",
  "onMarathonStoreDeploymentRollbackError"
];

// collapsing columns are tightly coupled to the left-align caret property;
// this wrapper allows ordinary columns to collapse.
function columnClassNameGetter(prop, sortBy, row) {
  const classSet = ResourceTableUtil.getClassName(prop, sortBy, row);
  if (COLLAPSING_COLUMNS.includes(prop)) {
    return classNames(classSet, "hidden-small-down");
  }

  return classSet;
}

const DeploymentsBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Deployments">
      <BreadcrumbTextContent>
        <Link to="/services/deployments">Deployments</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="services" breadcrumbs={crumbs} />;
};

class DeploymentsTab extends mixin(StoreMixin) {
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

  renderAffectedServices(prop, deployment) {
    return (
      <dl className="deployment-services-list flush-top flush-bottom tree-list">
        <dt className="deployment-id text-uppercase">
          <CollapsingString string={deployment.getId()} />
        </dt>
        {this.renderAffectedServicesList(deployment.getAffectedServices())}
        {this.renderStaleServicesList(deployment.getStaleServiceIds())}
      </dl>
    );
  }

  renderStaleServicesList(serviceIds) {
    if (serviceIds == null) {
      return;
    }

    return serviceIds.map(function(serviceId) {
      return (
        <dd key={`stale_${serviceId}`}>
          <span className="icon icon-mini icon-image-container icon-app-container deployment-service-icon">
            <img src={defaultServiceImage} />
          </span>
          {serviceId}
        </dd>
      );
    });
  }

  renderAffectedServicesList(services) {
    return services.map(function(service) {
      const id = encodeURIComponent(service.getId());
      const image = service.getImages()["icon-small"];

      return (
        <dd key={`service_${id}`}>
          <Link
            to={`/services/overview/${id}`}
            className="deployment-service-name table-cell-link-primary"
          >
            <span className="icon icon-mini icon-image-container icon-app-container deployment-service-icon">
              <img src={image} />
            </span>
            {service.getName()}
          </Link>
        </dd>
      );
    });
  }

  renderLocation(prop, deployment) {
    const services = deployment.getAffectedServices();
    const items = services.map(function(service, index) {
      return (
        <li key={index}>
          <NestedServiceLinks
            serviceID={service.getId()}
            className="deployment-breadcrumb"
            majorLinkClassName="deployment-breadcrumb-service-id"
            minorLinkWrapperClassName="deployment-breadcrumb-crumb"
          />
        </li>
      );
    });

    return (
      <ol className="deployment-location-list list-unstyled flush-bottom">
        {items}
      </ol>
    );
  }

  renderStartTime(prop, deployment) {
    return (
      <TimeAgo
        className="deployment-start-time"
        time={deployment.getStartTime()}
      />
    );
  }

  renderStatus(prop, deployment) {
    const currentStep = deployment.getCurrentStep();
    const totalSteps = deployment.getTotalSteps();
    const title = `Step ${currentStep} of ${totalSteps}`;
    const statusBar = this.renderStatusBar(currentStep, totalSteps);
    const services = deployment.getAffectedServices();

    let currentActions = {};
    if (deployment.currentActions && deployment.currentActions.length > 0) {
      currentActions = deployment.currentActions.reduce(function(memo, action) {
        memo[action.app] = action.action;

        return memo;
      }, {});
    }

    const items = services.map(function(service, index) {
      let statusText = service.getStatus();
      if (currentActions[service.id] != null) {
        statusText += ` (${currentActions[service.id]})`;
      }

      return (
        <li key={index}>
          {statusText}
        </li>
      );
    });

    return (
      <div>
        {statusBar}
        <span className="deployment-step">{title}</span>
        <ol className="deployment-status-list list-unstyled flush-bottom">
          {items}
        </ol>
      </div>
    );
  }

  renderStatusBar(currentStep, totalSteps) {
    const data = [
      { className: "color-4", value: currentStep - 1 },
      { className: "staged", value: 1 },
      { className: "", value: totalSteps - currentStep }
    ];

    return <StatusBar className="status-bar--large" data={data} />;
  }

  renderAction(prop, deployment) {
    if (deployment != null) {
      let linkText = "Rollback";
      if (deployment.isStarting()) {
        linkText = linkText + " & Remove";
      }

      return (
        <a
          className="deployment-rollback button button-link button-danger table-display-on-row-hover"
          onClick={this.handleRollbackClick.bind(null, deployment)}
        >
          {linkText}
        </a>
      );
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

  getColumns() {
    return [
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: "id",
        render: this.renderAffectedServices
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: "location",
        render: this.renderLocation
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: "startTime",
        render: this.renderStartTime
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: "status",
        render: this.renderStatus
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: "action",
        render: this.renderAction
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "300px" }} />
        <col className="hidden-small-down" />
        <col className="hidden-small-down" style={{ width: "120px" }} />
        <col style={{ width: "240px" }} />
        <col className="hidden-small-down" style={{ width: "160px" }} />
      </colgroup>
    );
  }

  renderEmpty() {
    return (
      <Page>
        <Page.Header breadcrumbs={<DeploymentsBreadcrumbs />} />
        <AlertPanel>
          <AlertPanelHeader>No active deployments</AlertPanelHeader>
          <p className="flush">Active deployments will be shown here.</p>
        </AlertPanel>
      </Page>
    );
  }

  renderLoading() {
    return <Loader />;
  }

  renderPopulated(deploymentsItems) {
    const deploymentsCount = deploymentsItems.length;
    const deploymentsLabel = StringUtil.pluralize(
      "Deployment",
      deploymentsCount
    );

    return (
      <Page>
        <Page.Header breadcrumbs={<DeploymentsBreadcrumbs />} />
        <h4 className="flush-top">
          {deploymentsCount} Active {deploymentsLabel}
        </h4>
        <Table
          className="table table-borderless-outer table-borderless-inner-columns
            flush-bottom deployments-table"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={deploymentsItems.slice()}
        />
        {this.renderRollbackModal()}
      </Page>
    );
  }

  renderRollbackModal() {
    const {
      awaitingRevertDeploymentResponse,
      deploymentToRollback,
      deploymentRollbackError
    } = this.state;

    const heading = (
      <ModalHeading>
        You're About To Rollback The Deployment
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
      return `This will stop the current deployment of ${listOfServiceNames}
              and start a new deployment to remove the affected ${service}.`;
    }

    return `This will stop the current deployment of ${listOfServiceNames} and
            start a new deployment to revert the affected ${service} to ${its}
            previous ${version}.`;
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
    const deployments = DCOSStore.deploymentsList.getItems();
    const loading = !DCOSStore.serviceDataReceived;

    if (loading) {
      return this.renderLoading();
    }
    if (deployments.length === 0) {
      return this.renderEmpty();
    } else {
      return this.renderPopulated(deployments);
    }
  }
}

DeploymentsTab.routeConfig = {
  label: "Deployments",
  matches: /^\/services\/deployments/
};

module.exports = DeploymentsTab;
