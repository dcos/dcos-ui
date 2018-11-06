import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";

import Alert from "#SRC/js/components/Alert";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import DateUtil from "#SRC/js/utils/DateUtil";
import TimeAgo from "#SRC/js/components/TimeAgo";
import DeclinedOffersHelpText from "../../constants/DeclinedOffersHelpText";
import DeclinedOffersTable from "../../components/DeclinedOffersTable";
import MarathonStore from "../../stores/MarathonStore";
import RecentOffersSummary from "../../components/RecentOffersSummary";
import Service from "../../structs/Service";
import Framework from "../../structs/Framework";
import TaskStatsTable from "./TaskStatsTable";

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

  getDeclinedOffersTable() {
    const { service } = this.props;

    if (!this.shouldShowDeclinedOfferTable()) {
      return null;
    }

    const queue = service.getQueue();

    return (
      <div>
        <Trans render={<ConfigurationMapHeading level={2} />}>Details</Trans>
        <DeclinedOffersTable
          offers={queue.declinedOffers.offers}
          service={service}
          summary={queue.declinedOffers.summary}
        />
      </div>
    );
  }

  getLastTaskFailureInfo() {
    const lastTaskFailure = this.props.service.getLastTaskFailure();
    if (lastTaskFailure == null) {
      return <Trans render="p">This app does not have failed tasks</Trans>;
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
          <Trans render={<ConfigurationMapLabel />}>Task ID</Trans>
          <ConfigurationMapValue>
            {this.getValueText(taskId)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>State</Trans>
          <ConfigurationMapValue>
            {this.getValueText(state)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Message</Trans>
          <ConfigurationMapValue>
            {this.getValueText(message)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Host</Trans>
          <ConfigurationMapValue>
            {this.getValueText(host)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Timestamp</Trans>
          <ConfigurationMapValue>
            {timestamp} (<TimeAgo time={new Date(timestamp)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Version</Trans>
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
      return (
        <Trans render="p">
          This app does not have version change information
        </Trans>
      );
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
          <Trans render={<ConfigurationMapLabel />}>Scale or Restart</Trans>
          <ConfigurationMapValue>{lastScaling}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Configuration</Trans>
          <ConfigurationMapValue>
            {`${lastConfigChangeAt} `}
            (<TimeAgo time={new Date(lastConfigChangeAt)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getRecentOfferSummaryContent() {
    const { service } = this.props;

    if (!this.shouldShowDeclinedOfferSummary()) {
      return null;
    }

    return (
      <div>
        <Trans render={<ConfigurationMapHeading level={2} />}>Summary</Trans>
        <RecentOffersSummary data={service.getQueue().declinedOffers.summary} />
      </div>
    );
  }

  getRecentOfferSummaryCount() {
    const { service } = this.props;

    if (!this.shouldShowDeclinedOfferSummary()) {
      return null;
    }

    const queue = service.getQueue();
    const {
      declinedOffers: { summary }
    } = queue;
    const {
      roles: { offers = 0 }
    } = summary;

    return ` (${offers})`;
  }

  getRecentOfferSummaryDisabledText(frameworkName) {
    if (frameworkName != null) {
      return (
        <Trans render="span">
          Rejected offer analysis is not currently supported for {frameworkName}.
        </Trans>
      );
    }

    return (
      <Trans render="span">
        Rejected offer analysis is not currently supported.
      </Trans>
    );
  }

  getRecentOfferSummaryIntroText() {
    const { service } = this.props;

    if (service instanceof Framework) {
      const frameworkName = service.getPackageName();

      return this.getRecentOfferSummaryDisabledText(frameworkName);
    }

    if (this.shouldShowDeclinedOfferSummary()) {
      return DeclinedOffersHelpText.summaryIntro;
    }

    return (
      <Trans render="span">
        Offers will appear here when your service is deploying or waiting for
        resources.
      </Trans>
    );
  }

  getRecentOfferSummary() {
    const introText = this.getRecentOfferSummaryIntroText();
    const mainContent = this.getRecentOfferSummaryContent();
    const offerCount = this.getRecentOfferSummaryCount();

    return (
      <div
        ref={ref => {
          this.offerSummaryRef = ref;
        }}
      >
        <Trans render={<ConfigurationMapHeading />}>
          Recent Resource Offers{offerCount}
        </Trans>
        <p>{introText}</p>
        {mainContent}
      </div>
    );
  }

  getTaskStats() {
    const taskStats = this.props.service.getTaskStats();

    if (taskStats.getList().getItems().length === 0) {
      return <Trans render="p">This app does not have task statistics</Trans>;
    }

    return <TaskStatsTable taskStats={taskStats} />;
  }

  getValueText(value) {
    if (value == null || value === "") {
      return <Trans render="p">Unspecified</Trans>;
    }

    return <span>{value}</span>;
  }

  getWaitingForResourcesNotice() {
    const { service } = this.props;

    if (service instanceof Framework) {
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
      <Alert showIcon={false} type="warning">
        <Trans render="span">
          DC/OS has been waiting for resources and is unable to complete this
          deployment for
        </Trans>{" "}
        {DateUtil.getDuration(timeWaiting, null)}
        {". "}
        <Trans
          render={
            <a
              className="clickable"
              onClick={this.handleJumpToRecentOffersClick}
            />
          }
        >
          See recent resource offers
        </Trans>.
      </Alert>
    );
  }

  handleJumpToRecentOffersClick() {
    if (this.offerSummaryRef) {
      this.offerSummaryRef.scrollIntoView();
    }
  }

  shouldShowDeclinedOfferSummary() {
    const { service } = this.props;

    return (
      !this.shouldSuppressDeclinedOfferDetails() &&
      service.getQueue().declinedOffers.summary != null
    );
  }

  shouldShowDeclinedOfferTable() {
    const { service } = this.props;

    return (
      !this.shouldSuppressDeclinedOfferDetails() &&
      service.getQueue().declinedOffers.offers != null
    );
  }

  shouldSuppressDeclinedOfferDetails() {
    const { service } = this.props;
    const queue = service.getQueue();

    return queue == null || service instanceof Framework;
  }

  render() {
    return (
      <div className="container">
        {this.getWaitingForResourcesNotice()}
        <ConfigurationMap>
          <ConfigurationMapSection>
            <Trans render={<ConfigurationMapHeading />}>Last Changes</Trans>
            {this.getLastVersionChange()}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <Trans render={<ConfigurationMapHeading />}>
              Last Task Failure
            </Trans>
            {this.getLastTaskFailureInfo()}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <Trans render={<ConfigurationMapHeading />}>Task Statistics</Trans>
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
  service: PropTypes.instanceOf(Service)
};

module.exports = ServiceDebugContainer;
