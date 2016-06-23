import classNames from 'classnames';
import {Confirm} from 'reactjs-components';
import {Link} from 'react-router';
import moment from 'moment';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Table} from 'reactjs-components';

import AlertPanel from '../../components/AlertPanel';
import DCOSStore from '../../stores/DCOSStore';
import Icon from '../../components/Icon';
import MarathonActions from '../../events/MarathonActions';
import NestedServiceLinks from '../../components/NestedServiceLinks';
import ResourceTableUtil from '../../utils/ResourceTableUtil';
import StringUtil from '../../utils/StringUtil';

const columnHeading = ResourceTableUtil.renderHeading({
  id: 'AFFECTED SERVICES',
  startTime: 'STARTED',
  location: 'LOCATION',
  status: 'STATUS',
  action: ''
});
const COLLAPSING_COLUMNS = ['location', 'startTime', 'action'];
const METHODS_TO_BIND = [
  'renderAffectedServices',
  'renderAffectedServicesList',
  'renderLocation',
  'renderStartTime',
  'renderStatus',
  'renderAction',
  'handleRollbackClick',
  'handleRollbackCancel',
  'handleRollbackConfirm',
  'onMarathonStoreDeploymentRollbackSuccess',
  'onMarathonStoreDeploymentRollbackError'
];

// collapsing columns are tightly coupled to the left-align caret property;
// this wrapper allows ordinary columns to collapse.
function columnClassNameGetter(prop, sortBy, row) {
  let classSet = ResourceTableUtil.getClassName(prop, sortBy, row);
  if (COLLAPSING_COLUMNS.includes(prop)) {
    return classNames(classSet, 'hidden-mini');
  }
  return classSet;
}

class DeploymentsTab extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.state = {};
    this.store_listeners = [
      {name: 'dcos', events: ['change']},
      {
        name: 'marathon',
        events: ['deploymentRollbackSuccess', 'deploymentRollbackError']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    }, this);
  }

  onMarathonStoreDeploymentRollbackSuccess(data) {
    let {deploymentToRollback} = this.state;
    if (deploymentToRollback != null &&
        deploymentToRollback.getId() === data.originalDeploymentID) {
      this.setState({
        awaitingRevertDeploymentResponse: false,
        deploymentToRollback: null,
        deploymentRollbackError: null
      });
    }
  }

  onMarathonStoreDeploymentRollbackError(data) {
    let {deploymentToRollback} = this.state;
    if (deploymentToRollback != null &&
        deploymentToRollback.getId() === data.originalDeploymentID) {
      this.setState({
        awaitingRevertDeploymentResponse: false,
        deploymentRollbackError: data.error
      });
    }
  }

  renderAffectedServices(prop, deployment) {
    return (
      <dl className="deployment-services-list flush-top flush-bottom tree-list">
        <dt className="deployment-id text-uppercase">{deployment.getId()}</dt>
        {this.renderAffectedServicesList(deployment.getAffectedServices())}
      </dl>
    );
  }

  renderAffectedServicesList(services) {
    return services.map(function (service, index) {
      const id = encodeURIComponent(service.getId());
      const image = service.getImages()['icon-small'];

      return (
        <dd key={index}>
          <Link to="services-detail" params={{id}} className="deployment-service-name">
            <span className="icon icon-small icon-image-container icon-app-container deployment-service-icon">
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
    const items = services.map(function (service, index) {
      return (
        <li key={index}>
          <NestedServiceLinks
            serviceID={service.getId()}
            className="deployment-breadcrumb"
            majorLinkClassName="deployment-breadcrumb-service-id"
            minorLinkWrapperClassName="deployment-breadcrumb-crumb" />
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
    const time = deployment.getStartTime();

    return (
      <time dateTime={time.toISOString()} className="deployment-start-time">
        {moment(time).fromNow()}
      </time>
    );
  }

  renderStatus(prop, deployment) {
    const title = `Step ${deployment.getCurrentStep()} of ${deployment.getTotalSteps()}`;
    const services = deployment.getAffectedServices();
    const items = services.map(function (service, index) {
      return (
        <li key={index}>
          {service.getStatus()}
        </li>
      );
    });

    return (
      <div>
        <span className="deployment-step">{title}</span>
        <ol className="deployment-status-list list-unstyled flush-bottom">{items}</ol>
      </div>
    );
  }

  renderAction(prop, deployment) {
    if (deployment != null) {
      let linkText = 'Rollback';
      if (deployment.isStarting()) {
        linkText = linkText + ' & Remove';
      }
      return (
        <a className="deployment-rollback button button-link button-danger table-display-on-row-hover"
            onClick={this.handleRollbackClick.bind(null, deployment)}>
          {linkText}
        </a>
      );
    }
  }

  handleRollbackClick(deployment) {
    this.setState({deploymentToRollback: deployment});
  }

  handleRollbackCancel() {
    this.setState({
      awaitingRevertDeploymentResponse: false,
      deploymentToRollback: null,
      deploymentRollbackError: null
    });
  }

  handleRollbackConfirm() {
    let {deploymentToRollback} = this.state;
    if (deploymentToRollback != null) {
      this.setState({awaitingRevertDeploymentResponse: true});
      MarathonActions.revertDeployment(deploymentToRollback.getId());
    }
  }

  getColumns() {
    return [
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: 'id',
        render: this.renderAffectedServices
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: 'location',
        render: this.renderLocation
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: 'startTime',
        render: this.renderStartTime
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: 'status',
        render: this.renderStatus
      },
      {
        className: columnClassNameGetter,
        heading: columnHeading,
        prop: 'action',
        render: this.renderAction
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '300px'}} />
        <col className="hidden-mini" />
        <col className="hidden-mini" style={{width: '120px'}} />
        <col style={{width: '240px'}} />
        <col className="hidden-mini" style={{width: '160px'}} />
      </colgroup>
    );
  }

  renderEmpty() {
    return (
      <AlertPanel
        title="No Deployments"
        icon={<Icon id="services" color="white" size="jumbo" />}>
        <p className="flush">Active deployments will be shown here.</p>
      </AlertPanel>
    );
  }

  renderPopulated(deploymentsItems) {
    let deploymentsCount = deploymentsItems.length;
    let deploymentsLabel = StringUtil.pluralize('Deployment', deploymentsCount);

    return (
      <div>
        <h4 className="inverse">
          {deploymentsCount} Active {deploymentsLabel}
        </h4>
        <Table
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom deployments-table"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={deploymentsItems.slice()} />
        {this.renderRollbackModal()}
      </div>
    );
  }

  renderRollbackModal() {
    let {
      awaitingRevertDeploymentResponse,
      deploymentToRollback,
      deploymentRollbackError
    } = this.state;

    if (deploymentToRollback != null) {
      return (
        <Confirm
          closeByBackdropClick={true}
          disabled={!!awaitingRevertDeploymentResponse}
          footerContainerClass="container container-pod container-pod-short
            container-pod-fluid flush-top flush-bottom"
          onClose={this.handleRollbackCancel}
          leftButtonCallback={this.handleRollbackCancel}
          leftButtonText="Cancel"
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleRollbackConfirm}
          rightButtonText="Continue Rollback">
          <div className="container-pod container-pod-short text-align-center">
            <h3 className="flush-top">You're About To Rollback The Deployment</h3>
            <p>{this.getRollbackModalText(deploymentToRollback)}</p>
            {this.renderRollbackError(deploymentRollbackError)}
          </div>
        </Confirm>
      );
    }
  }

  getRollbackModalText(deploymentToRollback) {
    let serviceNames = deploymentToRollback.getAffectedServices()
      .map(function (service) {
        return StringUtil.capitalize(service.getName());
      });
    let listOfServiceNames = StringUtil.humanizeArray(serviceNames);
    let serviceCount = serviceNames.length;

    let service = StringUtil.pluralize('service', serviceCount);
    let its = (serviceCount === 1) ? 'its' : 'their';
    let version = StringUtil.pluralize('version', serviceCount);

    if (deploymentToRollback.isStarting()) {
      return `This will stop the current deployment of ${listOfServiceNames}
              and start a new deployment to remove the affected ${service}.`
    }

    return `This will stop the current deployment of ${listOfServiceNames} and
            start a new deployment to revert the affected ${service} to ${its}
            previous ${version}.`
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
    let deployments = DCOSStore.deploymentsList.getItems();

    if (deployments.length === 0) {
      return this.renderEmpty();
    } else {
      return this.renderPopulated(deployments);
    }
  }

}

module.exports = DeploymentsTab;

