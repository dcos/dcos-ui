import React from 'react';
import {routerShape} from 'react-router';

import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import Pod from '../../structs/Pod';
import PodContainerTerminationTable from './PodContainerTerminationTable';
import TimeAgo from '../../../../../../src/js/components/TimeAgo';

class PodDebugTabView extends React.Component {
  getTerminationHistory() {
    let history = this.props.pod.getTerminationHistoryList().getItems();
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
    let {pod} = this.props;
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

  render() {
    return (
      <div>
        <h4 className="flush-top">
          Last Changes
        </h4>
        {this.getLastVersionChange()}
        {this.getTerminationHistory()}
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
