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
          <div>(No data)</div>
        );
    }

    return history.map(function (item, index) {
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

      return (
        <div key={index}>
          <h5 className="inverse flush-top">
            Terminated at {terminatedAt.toString()} (<TimeAgo time={terminatedAt} />)
          </h5>
          <DescriptionList hash={terminationValueMapping} />
          <h5 className="inverse flush-top">
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
        <h4 className="inverse flush-top">
          Last Changes
        </h4>
        {this.getLastVersionChange()}
        <h4 className="inverse flush-top">
          Last Terminations
        </h4>
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
