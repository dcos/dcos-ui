import React from 'react';
import {routerShape} from 'react-router';

import Alert from '../../../../../../src/js/components/Alert';
import DateUtil from '../../../../../../src/js/utils/DateUtil';
import DeclinedOffersHelpText from '../../constants/DeclinedOffersHelpText';
import DeclinedOffersTable from '../../components/DeclinedOffersTable';
import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import MarathonStore from '../../stores/MarathonStore';
import Pod from '../../structs/Pod';
import PodContainerTerminationTable from './PodContainerTerminationTable';
import RecentOffersSummary from '../../components/RecentOffersSummary';
import TimeAgo from '../../../../../../src/js/components/TimeAgo';

const METHODS_TO_BIND = ['handleJumpToRecentOffersClick'];

class PodDebugTabView extends React.Component {
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

  getDeclinedOffersTable() {
    const {pod} = this.props;
    const queue = pod.getQueue();

    if (queue == null || queue.declinedOffers.offers == null) {
      return null;
    }

    return (
      <div>
        <h2 className="short-bottom">Details</h2>
        <DeclinedOffersTable offers={queue.declinedOffers.offers}
          service={pod}
          summary={queue.declinedOffers.summary} />
      </div>
    );
  }

  getTerminationHistory() {
    const history = this.props.pod.getTerminationHistoryList().getItems();
    if (!history.length) {
      return (
        <div>
          <h4 className="flush-top">
            Last Terminations
          </h4>
          <p>(No data)</p>
        </div>
      );
    }

    return history.map(function (item, index) {
      let headline;
      let startedAt = item.getStartedAt();
      let terminatedAt = item.getTerminatedAt();
      let terminationValueMapping = {
        'Instance ID': item.getId(),
        'Message': item.getMessage(),
        'Started At': (
          <span>
            {startedAt.toString()} (<TimeAgo time={startedAt} />)
          </span>
        )
      };

      if (index === 0) {
        headline = (
          <h4 className="flush-top">
            Last Termination (<TimeAgo time={terminatedAt} />)
          </h4>
        );
      } else {
        headline = (
          <h4 className="flush-top">
            Terminated at {terminatedAt.toString()} (<TimeAgo time={terminatedAt} />)
          </h4>
        );
      }

      return (
        <div key={index}>
          {headline}
          <DescriptionList hash={terminationValueMapping} />
          <h5 className="flush-top">
            Containers
          </h5>
          <PodContainerTerminationTable containers={item.getContainers()} />
        </div>
      );
    });
  }

  getLastVersionChange() {
    const {pod} = this.props;
    let lastUpdated = pod.getLastUpdated();

    // Note to reader: `getLastChanged` refers to the last changes that happend
    // to the pod (such as state changes or instance changes), but we are
    // interested in the last configuration update, for which we are using the
    // `getLastUpdate` function.

    let LastVersionChangeValueMapping = {
      'Configuration': (
        <span>
          {lastUpdated.toString()} (<TimeAgo time={lastUpdated} />)
        </span>
      )
    };

    return <DescriptionList hash={LastVersionChangeValueMapping} />;
  }

  getRecentOfferSummary() {
    const queue = this.props.pod.getQueue();
    let introText = null;
    let mainContent = null;
    let offerCount = null;

    if (queue == null || queue.declinedOffers.summary == null) {
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
        DC/OS has been waiting for resources and unable to complete this deployment for {DateUtil.getDuration(timeWaiting, null)}. <a className="clickable" onClick={this.handleJumpToRecentOffersClick}>See recent resource offers</a>.
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
      <div>
        {this.getWaitingForResourcesNotice()}
        <h4 className="flush-top">
          Last Changes
        </h4>
        {this.getLastVersionChange()}
        {this.getTerminationHistory()}
        {this.getRecentOfferSummary()}
        {this.getDeclinedOffersTable()}
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
