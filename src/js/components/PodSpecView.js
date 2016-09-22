import React from 'react';

import DescriptionList from './DescriptionList';
import Icon from './Icon';
import PodContainerSpecView from './PodContainerSpecView';
import PodSpec from '../structs/PodSpec';

class PodSpecView extends React.Component {
  getEnvironmentDetails() {
    let environment = this.props.spec.getEnvironment();

    if (Object.keys(environment).length === 0) {
      return null;
    }

    let hash = Object.keys(environment).reduce(function (memo, key) {
      let value = environment[key];

      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        memo[key] = (
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

      return memo;
    }, {});

    return (
      <div>
        <h4 className="inverse flush-top">
          Environment variables
        </h4>
        <DescriptionList hash={hash} />
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
        <h4 className="inverse flush-top">
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
        <h4 className="inverse flush-top">
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
        <h4 className="inverse flush-top">
          Labels
        </h4>
        <DescriptionList hash={labels} />
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

PodSpecView.propTypes = {
  spec: React.PropTypes.instanceOf(PodSpec)
};

module.exports = PodSpecView;
