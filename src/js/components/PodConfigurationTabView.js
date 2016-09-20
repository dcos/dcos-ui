import React from 'react';

import Pod from '../structs/Pod';
import PodSpecView from './PodSpecView';

const METHODS_TO_BIND = [
];

class PodConfigurationTabView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  render() {
    let spec = this.props.pod.getSpec();
    let localeVersion = new Date(spec.getVersion()).toLocaleString();
    return (
      <div>
        <h3 className="inverse flush-top">
          Current Version ({localeVersion})
        </h3>
        <PodSpecView spec={spec} />
      </div>
      );
  }
};

PodConfigurationTabView.contextTypes = {
  router: React.PropTypes.func
};

PodConfigurationTabView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodConfigurationTabView;
