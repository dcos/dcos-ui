import React from 'react';
import {routerShape} from 'react-router';

import Alert from '../../../../../../src/js/components/Alert';
import DateUtil from '../../../../../../src/js/utils/DateUtil';
import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import MarathonStore from '../../stores/MarathonStore';
import RecentOffersSummary from '../../components/RecentOffersSummary';
import RejectedOffersTable from '../../components/RejectedOffersTable';
import Service from '../../structs/Service';
import TaskStatsTable from './TaskStatsTable';
import TimeAgo from '../../../../../../src/js/components/TimeAgo';

class ServiceDebugContainer extends React.Component {
  componentWillMount() {
    MarathonStore.setShouldEmbedLastUnusedOffers(true);
  }

  componentWillUnmount() {
    MarathonStore.setShouldEmbedLastUnusedOffers(false);
  }

  getValueText(value) {
    if (value == null || value === '') {
      return (
        <p>Unspecified</p>
      );
    }

    return (
      <span>{value}</span>
    );
  }

  getLastTaskFailureInfo() {
    let lastTaskFailure = this.props.service.getLastTaskFailure();
    if (lastTaskFailure == null) {
      return (
        <p>This app does not have failed tasks</p>
      );
    }

    const {version, timestamp, taskId, state, message, host} = lastTaskFailure;
    let taskFailureValueMapping = {
      'Task ID': this.getValueText(taskId),
      'State': this.getValueText(state),
      'Message': this.getValueText(message),
      'Host': this.getValueText(host),
      'Timestamp': (
        <span>
          {timestamp} (<TimeAgo time={new Date(timestamp)} />)
        </span>
      ),
      'Version': <span>{version} (<TimeAgo time={new Date(version)} />)</span>
    };

    return <DescriptionList hash={taskFailureValueMapping} />;
  }

  getLastVersionChange() {
    let versionInfo = this.props.service.getVersionInfo();
    if (versionInfo == null) {
      return (
        <p>This app does not have version change information</p>
      );
    }

    const {lastScalingAt, lastConfigChangeAt} = versionInfo;
    let lastScaling = 'No operation since last config change';
    if (lastScalingAt !== lastConfigChangeAt) {
      lastScaling = (
        <span>
          {lastScalingAt} (<TimeAgo time={new Date(lastScalingAt)} />)
        </span>
      );
    }

    let LastVersionChangeValueMapping = {
      'Scale or Restart': lastScaling,
      'Configuration': (
        <span>
          {lastConfigChangeAt} (<TimeAgo time={new Date(lastConfigChangeAt)} />)
        </span>
      )
    };

    return <DescriptionList hash={LastVersionChangeValueMapping} />;
  }

  getRecentOfferSummary() {
    // TODO: Transform API response into this format.
    const dummyData = [
      {
        resource: 'role',
        requested: ['*'],
        offers: 100000000,
        matched: 500
      },
      {
        resource: 'constraint',
        requested: ['rack:like:2'],
        offers: 500,
        matched: 500
      },
      {
        resource: 'resources',
        requested: {
          cpu: 1.2,
          mem: 256,
          disk: 2048,
          gpus: 0
        },
        offers: 500,
        matched: 250
      },
      {
        resource: 'ports',
        requested: [80, 1001],
        offers: 250,
        matched: 10
      }
    ];

    return <RecentOffersSummary data={dummyData} />;
  }

  getRejectedOffersTable() {
    // TODO: Transform API response into this format.
    const dummyData = [
      {
        hostname: '10.22.33.44',
        timestamp: '2010-02-28T16:41:41.090Z',
        unmatchedResources: ['role']
      },
      {
        hostname: '10.22.33.45',
        timestamp: '2011-02-28T16:41:41.090Z',
        unmatchedResources: ['constraint']
      },
      {
        hostname: '10.22.33.46',
        timestamp: '2012-02-28T16:41:41.090Z',
        unmatchedResources: ['cpu']
      },
      {
        hostname: '10.22.33.47',
        timestamp: '2013-02-28T16:41:41.090Z',
        unmatchedResources: ['mem']
      },
      {
        hostname: '10.22.33.48',
        timestamp: '2014-02-28T16:41:41.090Z',
        unmatchedResources: ['disk']
      },
      {
        hostname: '10.22.33.49',
        timestamp: '2015-02-28T16:41:41.090Z',
        unmatchedResources: ['port']
      },
      {
        hostname: '10.22.33.50',
        timestamp: '2016-02-28T16:41:41.090Z',
        unmatchedResources: ['role']
      },
      {
        hostname: '10.22.33.51',
        timestamp: '2017-02-28T16:41:41.090Z',
        unmatchedResources: ['constraint', 'role']
      },
      {
        hostname: '10.22.33.52',
        timestamp: '2018-02-28T16:41:41.090Z',
        unmatchedResources: ['cpu']
      },
      {
        hostname: '10.22.33.53',
        timestamp: '2019-02-28T16:41:41.090Z',
        unmatchedResources: ['mem']
      },
      {
        hostname: '10.22.33.54',
        timestamp: '2020-02-28T16:41:41.090Z',
        unmatchedResources: ['disk', 'port']
      },
      {
        hostname: '10.22.33.55',
        timestamp: '2021-02-28T16:41:41.090Z',
        unmatchedResources: ['port']
      }
    ];

    return <RejectedOffersTable data={dummyData} />;
  }

  getTaskStats() {
    let taskStats = this.props.service.getTaskStats();

    if (taskStats.getList().getItems().length === 0) {
      return (
        <p>This app does not have task statistics</p>
      );
    }

    return <TaskStatsTable taskStats={taskStats} />;
  }

  getWaitingForResourcesNotice() {
    // TODO: Determine when to actually display this and get the amount of
    // time waiting.
    const timeWaiting = 60 * 5;

    return (
      <Alert>
        This service has been waiting to find suitable offers for {DateUtil.getDuration(timeWaiting)} minutes. There is likely an issue that requires your attention.
      </Alert>
    );
  }

  render() {
    // TODO: Determine the actual values for these and display the offers data
    // conditionally.
    let recentOfferSummaryCount = 1000;
    let declinedOfferLimit = 100;

    return (
      <div>
        {this.getWaitingForResourcesNotice()}
        <h5 className="flush-top">
          Last Changes
        </h5>
        {this.getLastVersionChange()}
        <h5 className="flush-top">
          Last Task Failure
        </h5>
        {this.getLastTaskFailureInfo()}
        <h5 className="flush-top">
          Task Statistics
        </h5>
        {this.getTaskStats()}
        <h5>
          Summary of Recent Offers ({recentOfferSummaryCount})
        </h5>
        <p>
          When you attempt to deploy a service, DC/OS waits for offers to match the resources that your service requires. If the offer does not satisfy the requested amount, it is declined and we retry until we find a match.
        </p>
        {this.getRecentOfferSummary()}
        <h5>
          Last {declinedOfferLimit} Declined Offers
        </h5>
        {this.getRejectedOffersTable()}
      </div>
    );
  }
}

ServiceDebugContainer.contextTypes = {
  router: routerShape
};

ServiceDebugContainer.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDebugContainer;
