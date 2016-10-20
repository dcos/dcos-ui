import React from 'react';

import DescriptionList from '../../../../../../src/js/components/DescriptionList';

class PodNetworkSpecView extends React.Component {
  getGeneralDetails() {
    let {network: {name, mode}} = this.props;
    let hash = {
      Name: name,
      Mode: mode
    };

    hash = Object.keys(hash).filter(function (key) {
      return hash[key];
    }).reduce(function (memo, key) {
      memo[key] = hash[key];

      return memo;
    }, {});

    return <DescriptionList hash={hash} />;
  }

  getLabelSection() {
    let {network: {labels}} = this.props;
    if (!labels || !Object.keys(labels).length) {
      return null;
    }

    return (
      <div>
        <h5 className="flush-top">Labels</h5>
        <DescriptionList
          className="nested-description-list"
          hash={labels} />
      </div>
    );
  }

  render() {
    let {network: {name}} = this.props;

    return (
      <div className="pod-config-network">
        <h5 className="flush-top">
          {name}
        </h5>
        <div>
          {this.getGeneralDetails()}
          {this.getLabelSection()}
        </div>
      </div>
    );
  }
};

PodNetworkSpecView.propTypes = {
  network: React.PropTypes.object.isRequired
};

module.exports = PodNetworkSpecView;
