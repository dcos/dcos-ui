import React from "react";
import { routerShape } from "react-router";

import Alert from "../../../../../../src/js/components/Alert";
import ConfigurationMap
  from "../../../../../../src/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "../../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapValue
  from "../../../../../../src/js/components/ConfigurationMapValue";
import DateUtil from "../../../../../../src/js/utils/DateUtil";
import DeclinedOffersHelpText from "../../constants/DeclinedOffersHelpText";
import DeclinedOffersTable from "../../components/DeclinedOffersTable";
import DeclinedOffersUtil from "../../utils/DeclinedOffersUtil";
import MarathonStore from "../../stores/MarathonStore";
import RecentOffersSummary from "../../components/RecentOffersSummary";
import Service from "../../structs/Service";
import TaskStatsTable from "./TaskStatsTable";
import TimeAgo from "../../../../../../src/js/components/TimeAgo";

const METHODS_TO_BIND = ["handleJumpToRecentOffersClick"];

class ServiceDebugContainer extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
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
    if (value == null || value === "") {
      return <p>Unspecified</p>;
    }

    return <span>{value}</span>;
  }

  getLastTaskFailureInfo() {
    const lastTaskFailure = this.props.service.getLastTaskFailure();
    if (lastTaskFailure == null) {
      return <p>This app does not have failed tasks</p>;
    }

    const {
      version,
      timestamp,
      taskId,
      state,
      message,
      host
    } = lastTaskFailure;

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Task ID
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(taskId)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            State
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(state)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Message
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(message)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Host
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(host)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Timestamp
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {timestamp} (<TimeAgo time={new Date(timestamp)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Version
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {version} (<TimeAgo time={new Date(version)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getLastVersionChange() {
    const versionInfo = this.props.service.getVersionInfo();
    if (versionInfo == null) {
      return <p>This app does not have version change information</p>;
    }

    const { lastScalingAt, lastConfigChangeAt } = versionInfo;
    let lastScaling = "No operation since last config change";
    if (lastScalingAt !== lastConfigChangeAt) {
      lastScaling = (
        <span>
          {lastScalingAt} (<TimeAgo time={new Date(lastScalingAt)} />)
        </span>
      );
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Scale or Restart
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {lastScaling}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Configuration
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {`${lastConfigChangeAt} `}
            (<TimeAgo time={new Date(lastConfigChangeAt)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getRecentOfferSummary() {
    const { service } = this.props;
    const queue = service.getQueue();
    let introText = null;
    let mainContent = null;
    let offerCount = null;

    if (this.isFramework(service)) {
      const { labels = {} } = service;
      const frameworkName = labels.DCOS_PACKAGE_FRAMEWORK_NAME;

      if (frameworkName != null) {
        introText = `Rejected offer analysis is not currently supported for ${frameworkName}.`;
      } else {
        introText = "Rejected offer analysis is not currently supported.";
      }
    } else if (
      !DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(service) ||
      queue.declinedOffers.summary == null
    ) {
      introText =
        "Offers will appear here when your service is deploying or waiting for resources.";
    } else {
      const { declinedOffers: { summary } } = queue;
      const { roles: { offers = 0 } } = summary;

      introText = DeclinedOffersHelpText.summaryIntro;

      mainContent = (
        <div>
          <ConfigurationMapHeading level={2}>
            Summary
          </ConfigurationMapHeading>
          <RecentOffersSummary data={summary} />
        </div>
      );

      offerCount = ` (${offers})`;
    }

    return (
      <div
        ref={ref => {
          this.offerSummaryRef = ref;
        }}
      >
        <ConfigurationMapHeading>
          Recent Resource Offers{offerCount}
        </ConfigurationMapHeading>
        <p>{introText}</p>
        {mainContent}
      </div>
    );
  }

  getDeclinedOffersTable() {
    const { service } = this.props;

    if (this.isFramework(service)) {
      return null;
    }

    const queue = service.getQueue();

    if (
      !DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(service) ||
      queue.declinedOffers.offers == null
    ) {
      return null;
    }

    return (
      <div>
        <ConfigurationMapHeading level={2}>
          Details
        </ConfigurationMapHeading>
        <DeclinedOffersTable
          offers={queue.declinedOffers.offers}
          service={service}
          summary={queue.declinedOffers.summary}
        />
      </div>
    );
  }

  getTaskStats() {
    const taskStats = this.props.service.getTaskStats();

    if (taskStats.getList().getItems().length === 0) {
      return <p>This app does not have task statistics</p>;
    }

    return <TaskStatsTable taskStats={taskStats} />;
  }

  getWaitingForResourcesNotice() {
    const { service } = this.props;

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
        {
          "DC/OS has been waiting for resources and is unable to complete this deployment for "
        }
        {DateUtil.getDuration(timeWaiting, null)}{". "}
        <a className="clickable" onClick={this.handleJumpToRecentOffersClick}>
          See recent resource offers
        </a>.
      </Alert>
    );
  }

  handleJumpToRecentOffersClick() {
    if (this.offerSummaryRef) {
      this.offerSummaryRef.scrollIntoView();
    }
  }

  isFramework(service) {
    const { labels = {} } = service;

    return (
      labels.DCOS_PACKAGE_FRAMEWORK_NAME != null ||
      labels.DCOS_PACKAGE_IS_FRAMEWORK != null
    );
  }

  render() {
    return (
      <div className="container">
        {this.getWaitingForResourcesNotice()}
        <ConfigurationMap>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              Last Changes
            </ConfigurationMapHeading>
            {this.getLastVersionChange()}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              Last Task Failure
            </ConfigurationMapHeading>
            {this.getLastTaskFailureInfo()}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              Task Statistics
            </ConfigurationMapHeading>
            {this.getTaskStats()}
          </ConfigurationMapSection>
          {this.getRecentOfferSummary()}
          {this.getDeclinedOffersTable()}
        </ConfigurationMap>
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
