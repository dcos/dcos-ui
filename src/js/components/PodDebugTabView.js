import React from 'react';

import DescriptionList from './DescriptionList';
import Pod from '../structs/Pod';
import PodContainerTerminationTable from './PodContainerTerminationTable';
import TimeAgo from './TimeAgo';

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
    let lastChanged = pod.getLastChanged();

    let LastVersionChangeValueMapping = {
      'Configuration': (
        <span>
          {lastChanged.toString()} (<TimeAgo time={lastChanged} />)
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
  router: React.PropTypes.func
};

PodDebugTabView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDebugTabView;
