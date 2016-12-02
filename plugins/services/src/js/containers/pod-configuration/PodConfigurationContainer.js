import React from 'react';

import Pod from '../../structs/Pod';
import ServiceConfigDisplay from '../../components/ServiceConfigDisplay';

class PodConfigurationTabView extends React.Component {
  render() {
    let spec = this.props.pod.getSpec();
    let localeVersion = new Date(spec.getVersion()).toLocaleString();

    return (
      <div className="container">
        <h3 className="flush-top">
          Current Version ({localeVersion})
        </h3>
        <ServiceConfigDisplay appConfig={spec} />
      </div>
    );
  }
};

PodConfigurationTabView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodConfigurationTabView;
