import React from 'react';
import {routerShape} from 'react-router';

import Alert from '../../../../../../src/js/components/Alert';
import DateUtil from '../../../../../../src/js/utils/DateUtil';
import DeclinedOffersTable from '../../components/DeclinedOffersTable';
import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import MarathonStore from '../../stores/MarathonStore';
import RecentOffersSummary from '../../components/RecentOffersSummary';
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
    const queue = this.props.service.getQueue();

    if (queue == null || queue.declinedOffers.summary == null) {
      return null;
    }

    const {processedOffersSummary, declinedOffers: {summary}} = queue;
    const {processedOffersCount} = processedOffersSummary;

    return (
      <div>
        <h5>
          Summary of Recent Offers ({processedOffersCount})
        </h5>
        <p>
          When you attempt to deploy a service, DC/OS waits for offers to match the resources that your service requires. If the offer does not satisfy the requested amount, it is declined and we retry until we find a match.
        </p>
        <RecentOffersSummary data={summary} />
      </div>
    );
  }

  getDeclinedOffersTable() {
    const queue = this.props.service.getQueue();

    if (queue == null || queue.declinedOffers.offers == null) {
      return null;
    }

    const offerCount = queue.declinedOffers.offers.length;

    return (
      <div>
        <h5>Last {offerCount} Declined Offers</h5>
        <DeclinedOffersTable data={queue.declinedOffers.offers} />
      </div>
    );
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
    const queue = this.props.service.getQueue();

    if (queue == null || queue.since == null) {
      return null;
    }

    const waitingSince = DateUtil.strToMs(queue.since);
    const timeWaiting = Date.now() - waitingSince;

    // If the service has been waiting for less than five minutes, we don't
    // display the warning.
    if (timeWaiting < 1000 * 60 * 5) {
      return null;
    }

    return (
      <Alert>
        This service has been waiting to find suitable offers for {DateUtil.getDuration(timeWaiting, null)}. There is likely an issue that requires your attention.
      </Alert>
    );
  }

  render() {
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
        {this.getRecentOfferSummary()}
        {this.getDeclinedOffersTable()}
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
