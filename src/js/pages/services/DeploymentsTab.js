import moment from 'moment';
import React from 'react';
import {Table} from 'reactjs-components';

import AlertPanel from '../../components/AlertPanel';
import EventTypes from '../../constants/EventTypes';
import MarathonStore from '../../stores/MarathonStore';
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

class DeploymentsTab extends React.Component {

  constructor() {
    super(...arguments);
    this.onDeploymentsChange = this.onDeploymentsChange.bind(this);

    this.state = {
      deployments: MarathonStore.get('deployments')
    };
  }

  componentDidMount() {
    MarathonStore.addChangeListener(
      EventTypes.MARATHON_DEPLOYMENTS_CHANGE,
      this.onDeploymentsChange
    );
  }

  componentWillUnmount() {
    MarathonStore.removeChangeListener(
      EventTypes.MARATHON_DEPLOYMENTS_CHANGE,
      this.onDeploymentsChange
    );
  }

  onDeploymentsChange(deployments) {
    this.setState({deployments});
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

