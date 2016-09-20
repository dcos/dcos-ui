import React from 'react';

import DescriptionList from './DescriptionList';
import Icon from './Icon';

const METHODS_TO_BIND = [
];

class PodNetworkSpecView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getGeneralDetails() {
    let {network} = this.props;
    let hash = {};
    if (network.name) {
      hash['Name'] = network.name;
    }
    if (network.mode) {
      hash['Mode'] = network.mode;
    }

    return <DescriptionList hash={hash} />;
  }

  getLabelSection() {
    let {network} = this.props;
    if (!network.labels || !Object.keys(network.labels).length) {
      return null;
    }

    return (
      <div>
        <h5 className="inverse flush-top">Labels</h5>
        <DescriptionList
          className="nested-description-list"
          hash={network.labels} />
      </div>
      );
  }

  render() {
    let {network} = this.props;

    return (
      <div className="pod-config-network">
        <h5 className="inverse flush-top">
          <Icon
            className="icon-margin-right"
            color="white"
            family="mini"
            id="network"
            size="mini" />
          {network.name}
        </h5>
        <div className="pod-config-resource-group pod-config-resource-group-network">
          {this.getGeneralDetails()}
          {this.getLabelSection()}
        </div>
      </div>
      );
  }
};

PodNetworkSpecView.contextTypes = {
  router: React.PropTypes.func
};

PodNetworkSpecView.propTypes = {
  network: React.PropTypes.object
};

module.exports = PodNetworkSpecView;
