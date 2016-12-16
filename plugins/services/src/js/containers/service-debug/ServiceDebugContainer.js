import React from 'react';
import {routerShape} from 'react-router';

import Alert from '../../../../../../src/js/components/Alert';
import DateUtil from '../../../../../../src/js/utils/DateUtil';
import DeclinedOffersHelpText from '../../constants/DeclinedOffersHelpText';
import DeclinedOffersTable from '../../components/DeclinedOffersTable';
import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import MarathonStore from '../../stores/MarathonStore';
import RecentOffersSummary from '../../components/RecentOffersSummary';
import Service from '../../structs/Service';
import TaskStatsTable from './TaskStatsTable';
import TimeAgo from '../../../../../../src/js/components/TimeAgo';

const METHODS_TO_BIND = ['handleJumpToRecentOffersClick'];

class ServiceDebugContainer extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

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
    const lastTaskFailure = this.props.service.getLastTaskFailure();
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
    const versionInfo = this.props.service.getVersionInfo();
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

    const LastVersionChangeValueMapping = {
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
    const {service} = this.props;
    const queue = service.getQueue();
    let introText = null;
    let mainContent = null;
    let offerCount = null;

    if (this.isFramework(service)) {
      const {labels = {}} = service;
      const frameworkName = labels.DCOS_PACKAGE_FRAMEWORK_NAME;

      if (frameworkName != null) {
        introText = `Rejected offer analysis is not currently supported for ${frameworkName}.`;
      } else {
        introText = 'Rejected offer analysis is not currently supported.';
      }
    } else if (queue == null || queue.declinedOffers.summary == null) {
      introText = 'Offers will appear here when your service is deploying or waiting for resources.';
    } else {
      const {declinedOffers: {summary}} = queue;
      const {roles: {offers = 0}} = summary;

      introText = DeclinedOffersHelpText.summaryIntro;

      mainContent = (
        <div>
          <h2 className="short-bottom">
            Summary
          </h2>
          <RecentOffersSummary data={summary} />
        </div>
      );

      offerCount = ` (${offers})`;
    }

    return (
      <div ref={(ref) => { this.offerSummaryRef = ref; }}>
        <h1 className="short-bottom">Recent Resource Offers{offerCount}</h1>
        <p>{introText}</p>
        {mainContent}
      </div>
    );
  }

  getDeclinedOffersTable() {
    const {service} = this.props;

    if (this.isFramework(service)) {
      return null;
    }

    const queue = service.getQueue();

    if (queue == null || queue.declinedOffers.offers == null) {
      return null;
    }

    return (
      <div>
        <h2 className="short-bottom">Details</h2>
        <DeclinedOffersTable offers={queue.declinedOffers.offers}
          service={service}
          summary={queue.declinedOffers.summary} />
      </div>
    );
  }

  getTaskStats() {
    const taskStats = this.props.service.getTaskStats();

    if (taskStats.getList().getItems().length === 0) {
      return (
        <p>This app does not have task statistics</p>
      );
    }

    return <TaskStatsTable taskStats={taskStats} />;
  }

  getWaitingForResourcesNotice() {
    const {service} = this.props;

    if (this.isFramework(service)) {
      return null;
    }

    const queue = service.getQueue();

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
        DC/OS has been waiting for resources and unable to complete this deployment for {DateUtil.getDuration(timeWaiting, null)}. <a className="clickable" onClick={this.handleJumpToRecentOffersClick}>See recent resource offers</a>.
      </Alert>
    );
  }

  handleJumpToRecentOffersClick() {
    if (this.offerSummaryRef) {
      this.offerSummaryRef.scrollIntoView();
    }
  }

  isFramework(service) {
    const {labels = {}} = service;

    return labels.DCOS_PACKAGE_FRAMEWORK_NAME != null
      || labels.DCOS_PACKAGE_IS_FRAMEWORK != null;
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
