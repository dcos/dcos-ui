import React from 'react';

import Pod from '../../structs/Pod';
import PodSpecView from './PodSpecView';

class PodConfigurationTabView extends React.Component {
  render() {
    let spec = this.props.pod.getSpec();
    let localeVersion = new Date(spec.getVersion()).toLocaleString();

    return (
      <div>
        <h3 className="flush-top">
          Current Version ({localeVersion})
        </h3>
        <PodSpecView spec={spec} />
      </div>
    );
  }
};

PodConfigurationTabView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodConfigurationTabView;
