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
  'handleRollbackConfirm'
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

    this.state = {deployments: DCOSStore.deploymentsList};
    this.store_listeners = [
      {name: 'dcos', events: ['change'], suppressUpdate: true}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    }, this);
  }

  onDcosStoreChange() {
    this.setState({deployments: DCOSStore.deploymentsList});
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
            {StringUtil.capitalize(service.getName())}
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
    this.setState({deploymentToRollback: null});
  }

  handleRollbackConfirm() {
    MarathonActions.revertDeployment(this.state.deploymentToRollback.id);
    this.setState({deploymentToRollback: null});
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
        iconClassName="icon icon-sprite icon-sprite-jumbo
            icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush">Active deployments will be shown here.</p>
      </AlertPanel>
    );
  }

  renderPopulated() {
    let {deployments} = this.state;
    let deploymentsItems = deployments.getItems();
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
    let {deploymentToRollback} = this.state;
    if (deploymentToRollback != null) {
      return (
        <Confirm
          closeByBackdropClick={true}
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

  render() {
    let deployments = this.state.deployments.getItems();

    if (deployments.length === 0) {
      return this.renderEmpty();
    } else {
      return this.renderPopulated();
    }
  }

}

module.exports = DeploymentsTab;

