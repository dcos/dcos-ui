import moment from 'moment';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Table} from 'reactjs-components';

import AlertPanel from '../../components/AlertPanel';
import DCOSStore from '../../stores/DCOSStore';
import ResourceTableUtil from '../../utils/ResourceTableUtil';
import StringUtil from '../../utils/StringUtil'

const columnClassNameGetter = ResourceTableUtil.getClassName;
const columnHeading = ResourceTableUtil.renderHeading({
  id: 'DEPLOYMENT',
  startTime: 'STARTED',
  status: 'STATUS'
});
const columns = [
  {
    className: columnClassNameGetter,
    heading: columnHeading,
    prop: 'id',
    render: function (prop, deployment) {
      return deployment.getId();
    }
  },
  {
    className: columnClassNameGetter,
    heading: columnHeading,
    prop: 'startTime',
    render: function (prop, deployment) {
      return moment(deployment.getStartTime()).fromNow();
    }
  },
  {
    className: columnClassNameGetter,
    heading: columnHeading,
    prop: 'status',
    render: function (prop, deployment) {
      return `Step ${deployment.getCurrentStep()} of ${deployment.getTotalSteps()}`;
    }
  }
];

class DeploymentsTab extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.state = {deployments: DCOSStore.deploymentsList};
    this.store_listeners = [
      {name: 'dcos', events: ['change'], suppressUpdate: true}
    ];
  }

  onDcosStoreChange() {
    this.setState({deployments: DCOSStore.deploymentsList});
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
          className="table inverse table-borderless-outer
              table-borderless-inner-columns flush-bottom"
          columns={columns}
          data={deploymentsItems.slice()} />
      </div>
    );
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

