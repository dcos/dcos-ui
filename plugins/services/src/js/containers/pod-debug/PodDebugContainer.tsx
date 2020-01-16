import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";
import { InfoBoxInline } from "@dcos/ui-kit";

import DateUtil from "#SRC/js/utils/DateUtil";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import TimeAgo from "#SRC/js/components/TimeAgo";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import DeclinedOffersHelpText from "../../constants/DeclinedOffersHelpText";
import DeclinedOffersTable from "../../components/DeclinedOffersTable";
import MarathonStore from "../../stores/MarathonStore";
import Pod from "../../structs/Pod";
import PodContainerTerminationTable from "./PodContainerTerminationTable";
import RecentOffersSummary from "../../components/RecentOffersSummary";

class PodDebugTabView extends React.Component {
  constructor(...args) {
    super(...args);
  }

  UNSAFE_componentWillMount() {
    MarathonStore.setShouldEmbedLastUnusedOffers(true);
  }

  componentWillUnmount() {
    MarathonStore.setShouldEmbedLastUnusedOffers(false);
  }

  getDeclinedOffersTable() {
    const { pod } = this.props;
    const queue = pod.getQueue();

    if (queue == null || queue.declinedOffers.offers == null) {
      return null;
    }

    return (
      <div>
        <Trans render={<ConfigurationMapHeading level={2} />}>Details</Trans>
        <DeclinedOffersTable
          offers={queue.declinedOffers.offers}
          service={pod}
          summary={queue.declinedOffers.summary}
        />
      </div>
    );
  }

  getTerminationHistory() {
    const history = this.props.pod.getTerminationHistoryList().getItems();
    if (!history.length) {
      return (
        <ConfigurationMapSection>
          <Trans render={<ConfigurationMapHeading />}>Last Terminations</Trans>
          <Trans render="p">(No data)</Trans>
        </ConfigurationMapSection>
      );
    }

    return history.reduce((acc, item, index) => {
      let headline;
      const startedAt = item.getStartedAt();
      const terminatedAt = item.getTerminatedAt();

      if (index === 0) {
        headline = (
          <Trans render={<ConfigurationMapHeading level={2} />}>
            Last Termination (<TimeAgo time={terminatedAt} />)
          </Trans>
        );
      } else {
        headline = (
          <Trans render={<ConfigurationMapHeading level={2} />}>
            Terminated at {terminatedAt.toString()} (
            <TimeAgo time={terminatedAt} />)
          </Trans>
        );
      }

      acc.push(
        <ConfigurationMapSection key={`termination-${index}`}>
          {headline}
          <ConfigurationMapSection>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Instance ID</Trans>
              <ConfigurationMapValue>{item.getId()}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Message</Trans>
              <ConfigurationMapValue>{item.getMessage()}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Started At</Trans>
              <ConfigurationMapValue>
                {startedAt.toString()} (<TimeAgo time={startedAt} />)
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMapSection>,
        <ConfigurationMapSection key={`container-${index}`}>
          <Trans render={<ConfigurationMapHeading level={3} />}>
            Containers
          </Trans>
          <PodContainerTerminationTable containers={item.getContainers()} />
        </ConfigurationMapSection>
      );

      return acc;
    }, []);
  }

  getLastVersionChange() {
    const { pod } = this.props;
    const lastUpdated = pod.getLastUpdated();

    // Note to reader: `getLastChanged` refers to the last changes that happened
    // to the pod (such as state changes or instance changes), but we are
    // interested in the last configuration update, for which we are using the
    // `getLastUpdate` function.

    return (
      <ConfigurationMapSection>
        <Trans render={<ConfigurationMapHeading />}>Last Changes</Trans>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Configuration</Trans>
          <ConfigurationMapValue>
            {lastUpdated.toString()} (<TimeAgo time={lastUpdated} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getRecentOfferSummary() {
    const { pod } = this.props;
    const queue = pod.getQueue();
    let introText = (
      <Trans render="span">
        Offers will appear here when your service is deploying or waiting for
        resources.
      </Trans>
    );
    let mainContent = null;
    let offerCount = null;

    if (queue != null && queue.declinedOffers.summary != null) {
      const {
        declinedOffers: { summary }
      } = queue;
      const {
        roles: { offers = 0 }
      } = summary;

      introText = DeclinedOffersHelpText.summaryIntro;

      mainContent = (
        <div>
          <Trans render={<ConfigurationMapHeading level={2} />}>Summary</Trans>
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
        <Trans render={<ConfigurationMapHeading />}>
          Recent Resource Offers{offerCount}
        </Trans>
        <p>{introText}</p>
        {mainContent}
      </div>
    );
  }

  getUnableToStartNotice() {
    const queue = this.props.pod.getQueue();

    if (queue == null || queue.since == null) {
      return null;
    }

    const waitingSince = DateUtil.strToMs(queue.since);
    const timeWaiting = Date.now() - waitingSince;

    let message,
      primaryAction,
      secondaryAction = null;

    if (this.props.pod.isDelayed()) {
      message = (
        <Trans render="span">
          DC/OS has delayed the launching of this service due to failures.
        </Trans>
      );
      secondaryAction = (
        <Trans render="span">
          <a
            className="clickable"
            target="_blank"
            onClick={() => MarathonStore.resetDelayedService(this.props.pod)}
          >
            Retry now
          </a>
        </Trans>
      );
      primaryAction = (
        <Trans render="span">
          <a
            href={MetadataStore.buildDocsURI("/services#service-status")}
            target="_blank"
          >
            More information
          </a>{" "}
        </Trans>
      );
      // If the service has been waiting for less than five minutes, we don't
      // display the warning.
    } else if (timeWaiting >= 1000 * 60 * 5) {
      /* L10NTODO: Relative time */
      message = (
        <Trans render="span">
          DC/OS has been waiting for resources and is unable to complete this
          deployment for {DateUtil.getDuration(timeWaiting)}.
        </Trans>
      );
      primaryAction = (
        <Trans
          render={
            <div
              className="clickable button-link button-primary"
              onClick={this.handleJumpToRecentOffersClick}
              tabIndex={0}
              role="button"
            />
          }
        >
          See recent resource offers
        </Trans>
      );
    }

    return (
      <div className="infoBoxWrapper">
        <InfoBoxInline
          appearance="warning"
          message={message}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />
      </div>
    );
  }
  handleJumpToRecentOffersClick = () => {
    if (this.offerSummaryRef) {
      this.offerSummaryRef.scrollIntoView();
    }
  };

  render() {
    return (
      <div className="container">
        {this.getUnableToStartNotice()}
        <ConfigurationMap>
          {this.getLastVersionChange()}
          {this.getTerminationHistory()}
          {this.getRecentOfferSummary()}
          {this.getDeclinedOffersTable()}
        </ConfigurationMap>
      </div>
    );
  }
}

PodDebugTabView.contextTypes = {
  router: routerShape
};

PodDebugTabView.propTypes = {
  pod: PropTypes.instanceOf(Pod)
};

export default PodDebugTabView;
