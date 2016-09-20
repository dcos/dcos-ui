import React from 'react';

import DescriptionList from './DescriptionList';
import PodSpec from '../structs/PodSpec';
import PodContainerSpecView from './PodContainerSpecView';
import PodNetworkSpecView from './PodNetworkSpecView';
import Icon from './Icon';

const METHODS_TO_BIND = [
];

class PodSpecView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getEnvironmentDetails() {
    let {spec} = this.props;
    let environment = Object.assign({}, spec.getEnvironment());

    if (Object.keys(environment).length === 0) {
      return null;
    }

    Object.keys(environment).forEach(function (key) {
      let value = environment[key];
      if (typeof value === 'object' && !Array.isArray(value) &&
          value !== null) {
        environment[key] = (
          <span>
            <Icon
              className="icon-margin-right"
              color="white"
              family="mini"
              id="key"
              size="mini" /> {value.secret}
          </span>
        );
      }
    });

    return (
      <div>
        <h4 className="inverse flush-top">
          Environment variables
        </h4>
        <DescriptionList hash={environment} />
      </div>
    );
  }

  getScalingDetails() {
    let {spec} = this.props;
    let scaling = spec.getScaling();

    if (Object.keys(scaling).length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="inverse flush-top">
          Scaling
        </h4>
        <DescriptionList hash={scaling} />
      </div>
    );
  }

  getSecretsDetails() {
    let {spec} = this.props;
    let secrets = Object.assign({}, spec.getSecrets());

    if (Object.keys(secrets).length === 0) {
      return null;
    }

    Object.keys(secrets).forEach(function (key) {
      let {source} = secrets[key];
      secrets[key] = source;
    });

    return (
      <div>
        <h4 className="inverse flush-top">
          Secrets
        </h4>
        <DescriptionList hash={secrets} />
      </div>
    );
  }

  getLabelsDetails() {
    let {spec} = this.props;
    let labels = spec.getLabels();

    if (Object.keys(labels).length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="inverse flush-top">
          Labels
        </h4>
        <DescriptionList hash={labels} />
      </div>
    );
  }

  getNetworksDetails() {
    let {spec} = this.props;
    let networks = spec.getNetworks();

    if (networks.length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="inverse flush-top">
          Networks
        </h4>
        {networks.map(function (network, i) {
          return (
            <PodNetworkSpecView
              key={i}
              network={network} />
          );
        })}
      </div>
    );
  }

  getGeneralDetails() {
    let {spec} = this.props;
    let hash = {
      'ID': spec.getId()
    };

    let version = spec.getVersion();
    if (version) {
      hash.version = version;
    }

    let user = spec.getUser();
    if (user) {
      hash.user = user;
    }

    return <DescriptionList hash={hash} />;
  }

  getVolumesDetails() {
    let {spec} = this.props;
    let volumes = spec.getVolumes().map(function (volume) {
      return {
        [volume.name]: volume.host || '-'
      };
    });

    if (volumes.length === 0) {
      return null;
    }

    return (
      <div>
        <h4 className="inverse flush-top">
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

  render() {
    let {spec} = this.props;

    return (
      <div>
        <h4 className="inverse flush-top">
          General
        </h4>
        {this.getGeneralDetails()}
        {this.getLabelsDetails()}
        {this.getEnvironmentDetails()}
        {this.getSecretsDetails()}
        {this.getVolumesDetails()}
        {this.getScalingDetails()}
        {this.getNetworksDetails()}
        <h4 className="inverse flush-top">
          Containers
        </h4>
        {spec.getContainers().map(function (container, i) {
          return (
              <PodContainerSpecView
                key={i}
                className="nested-description-list"
                container={container} />
            );
        })}
      </div>
      );
  }
};

PodSpecView.contextTypes = {
  router: React.PropTypes.func
};

PodSpecView.propTypes = {
  spec: React.PropTypes.instanceOf(PodSpec)
};

module.exports = PodSpecView;
