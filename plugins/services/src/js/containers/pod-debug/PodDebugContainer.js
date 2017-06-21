import React from "react";
import { routerShape } from "react-router";

import Alert from "../../../../../../src/js/components/Alert";
import DateUtil from "../../../../../../src/js/utils/DateUtil";
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
import DeclinedOffersHelpText from "../../constants/DeclinedOffersHelpText";
import DeclinedOffersTable from "../../components/DeclinedOffersTable";
import DeclinedOffersUtil from "../../utils/DeclinedOffersUtil";
import MarathonStore from "../../stores/MarathonStore";
import Pod from "../../structs/Pod";
import PodContainerTerminationTable from "./PodContainerTerminationTable";
import RecentOffersSummary from "../../components/RecentOffersSummary";
import TimeAgo from "../../../../../../src/js/components/TimeAgo";

const METHODS_TO_BIND = ["handleJumpToRecentOffersClick"];

class PodDebugTabView extends React.Component {
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
    const { pod } = this.props;
    const queue = pod.getQueue();

    if (
      !DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(pod) ||
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
          <ConfigurationMapHeading>
            Last Terminations
          </ConfigurationMapHeading>
          <p>(No data)</p>
        </ConfigurationMapSection>
      );
    }

    return history.reduce(function(acc, item, index) {
      let headline;
      const startedAt = item.getStartedAt();
      const terminatedAt = item.getTerminatedAt();

      if (index === 0) {
        headline = (
          <ConfigurationMapHeading level={2}>
            Last Termination (<TimeAgo time={terminatedAt} />)
          </ConfigurationMapHeading>
        );
      } else {
        headline = (
          <ConfigurationMapHeading level={2}>
            Terminated at
            {" "}
            {terminatedAt.toString()}
            {" "}
            (
            <TimeAgo time={terminatedAt} />
            )
          </ConfigurationMapHeading>
        );
      }

      acc.push(
        <ConfigurationMapSection key={`termination-${index}`}>
          {headline}
          <ConfigurationMapSection>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Instance ID
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {item.getId()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Message
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {item.getMessage()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Started At
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {startedAt.toString()} (<TimeAgo time={startedAt} />)
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMapSection>,
        <ConfigurationMapSection key={`container-${index}`}>
          <ConfigurationMapHeading level={3}>
            Containers
          </ConfigurationMapHeading>
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
        <ConfigurationMapHeading>
          Last Changes
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Configuration
          </ConfigurationMapLabel>
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
    let introText = null;
    let mainContent = null;
    let offerCount = null;

    if (
      !DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(pod) ||
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

  getWaitingForResourcesNotice() {
    const queue = this.props.pod.getQueue();

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

  render() {
    return (
      <div className="container">
        {this.getWaitingForResourcesNotice()}
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
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDebugTabView;
