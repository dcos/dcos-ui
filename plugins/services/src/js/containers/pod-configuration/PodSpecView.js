import React from 'react';

import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import EnvironmentList from '../../../../../../src/js/components/EnvironmentList';
import PodContainerSpecView from './PodContainerSpecView';
import PodSpec from '../../structs/PodSpec';
import PodNetworkSpecView from './PodNetworkSpecView';

class PodSpecView extends React.Component {
  getEnvironmentDetails() {
    let environment = this.props.spec.getEnvironment();

    if (!environment || Object.keys(environment).length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="flush-top">
          Environment variables
        </h4>
        <EnvironmentList environment={environment} />
      </div>
    );
  }

  getScalingDetails() {
    let scaling = this.props.spec.getScaling();

    if (Object.keys(scaling).length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="flush-top">
          Scaling
        </h4>
        <DescriptionList hash={scaling} />
      </div>
    );
  }

  getSecretsDetails() {
    let secrets = this.props.spec.getSecrets();

    if (Object.keys(secrets).length === 0) {
      return null;
    }

    let hash = Object.keys(secrets).reduce(function (memo, key) {
      memo[key] = secrets[key].source;

      return memo;
    }, {});

    return (
      <div>
        <h4 className="flush-top">
          Secrets
        </h4>
        <DescriptionList hash={hash} />
      </div>
    );
  }

  getLabelsDetails() {
    let labels = this.props.spec.getLabels();

    if (Object.keys(labels).length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="flush-top">
          Labels
        </h4>
        <DescriptionList hash={labels} />
      </div>
    );
  }

  getNetworksDetails() {
    let networks = this.props.spec.getNetworks();

    if (networks.length === 0) {
      return null;
    }

    let nodes = networks.map(function (network, i) {
      return (
        <PodNetworkSpecView
          key={i}
          network={network} />
      );
    });

    return (
      <div>
        <h4 className="flush-top">
          Networks
        </h4>
        {nodes}
      </div>
    );
  }

  getGeneralDetails() {
    let {spec} = this.props;
    let hash = {
      ID: spec.getId(),
      version: spec.getVersion(),
      user: spec.getUser()
    };

    hash = Object.keys(hash).filter(function (key) {
      return hash[key];
    }).reduce(function (memo, key) {
      memo[key] = hash[key];

      return memo;
    }, {});

    return <DescriptionList hash={hash} />;
  }

  getVolumesDetails() {
    let volumes = this.props.spec.getVolumes().map(function (volume) {
      return {
        [volume.name]: volume.host || '-'
      };
    });

    if (volumes.length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="flush-top">
          Volumes
        </h4>
        {volumes.map(function (volume, i) {
          return (
            <DescriptionList
              key={i}
              hash={volume} />
          );
        })}
      </div>
    );
  }

  getContainersSection() {
    let {spec} = this.props;

    return spec.getContainers().map(function (container, i) {
      return (
        <PodContainerSpecView
          key={i}
          className="nested-description-list"
          container={container} />
      );
    });
  }

  render() {
    return (
      <div>
        <h4 className="flush-top">
          General
        </h4>
        {this.getGeneralDetails()}
        {this.getLabelsDetails()}
        {this.getEnvironmentDetails()}
        {this.getSecretsDetails()}
        {this.getVolumesDetails()}
        {this.getScalingDetails()}
        {this.getNetworksDetails()}
        <h4 className="flush-top">
          Containers
        </h4>
        {this.getContainersSection()}
      </div>
    );
  }
};

PodSpecView.propTypes = {
  spec: React.PropTypes.instanceOf(PodSpec)
};

module.exports = PodSpecView;
