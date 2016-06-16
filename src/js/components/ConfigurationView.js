import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import DCOSStore from '../stores/DCOSStore';
import DescriptionList from './DescriptionList';
import Service from '../structs/Service';
import StringUtil from '../utils/StringUtil';

const sectionClassName = 'container-fluid container-pod container-pod-super-short flush flush-bottom';

function fetchVersion(service, versionID) {
  if (service.getVersions().get(versionID) == null) {
    DCOSStore.fetchServiceVersion(service.getId(), versionID);
  }
}

class ConfigurationView extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [{name: 'dcos', events: ['change']}];
  }

  componentWillMount() {
    super.componentWillMount();

    let {service, versionID} = this.props;
    fetchVersion(service, versionID);
  }

  componentWillReceiveProps({service, versionID}) {
    super.componentWillReceiveProps(...arguments);

    fetchVersion(service, versionID);
  }

  getGenralSection({id, cmd, cpus, disk, instances, mem}) {
    let headerValueMapping = {
      'ID': id,
      'CPUs': cpus,
      'Memory (MiB)': mem,
      'Disk Space (Mib)': disk,
      'Instances': instances,
      'Command': cmd
    };

    return (
      <DescriptionList className={sectionClassName}
        hash={headerValueMapping}
        headline="General" />
    );
  }

  getDockerContainerSection({container}) {
    if (container == null || container.docker == null) {
      return null;
    }

    let {docker} = container;

    let headerValueMapping = {
      'Force Pull Image': docker.forcePullImage,
      'Image': docker.image,
      'Network': docker.network,
      'Parameters': StringUtil.arrayToJoinedString(docker.parameters),
      'Privileged': docker.privileged
    };

    return (
      <DescriptionList className={sectionClassName}
        hash={headerValueMapping}
        headline="Docker Container" />
    );
  }

  getPortDefinitionsSection({portDefinitions}) {
    if (portDefinitions == null) {
      return null;
    }

    let portConfigurations = portDefinitions.map(
      function (portDefinition, index) {
        let headline = `Port Definition ${index + 1}`;

        if (portDefinition.name) {
          headline += ` (${portDefinition.name})`;
        }

        return (
          <DescriptionList className="nested-description-list"
            hash={portDefinition}
            headline={headline}
            key={index} />
        );
      });

    return (
      <div className={sectionClassName}>
        <h5 className="inverse flush-top">Port Definitions</h5>
        {portConfigurations}
      </div>
    );
  }

  getHealthChecksSection({healthChecks}) {
    if (healthChecks == null) {
      return null;
    }

    let healthCheckConfigurations = healthChecks.map(
      function (healthCheck, index) {

        let headerValueMapping = {
          'Protocol': healthCheck.protocol,
          'Grace Period Seconds': healthCheck.gracePeriodSeconds,
          'Interval Seconds': healthCheck.intervalSeconds,
          'Timeout Seconds': healthCheck.intervalSeconds,
          'Max Consecutive Failures': healthCheck.maxConsecutiveFailures
        };

        switch (healthCheck.protocol) {
          case 'COMMAND':
            headerValueMapping = Object.assign(headerValueMapping, {
              'Command': healthCheck.command.value,
            });
            break;
          case 'HTTP':
            headerValueMapping = Object.assign(headerValueMapping, {
              'Path': healthCheck.path,
              'Port': healthCheck.port,
              'Port Index': healthCheck.portIndex,
              'Port Type': healthCheck.portType || 'PORT_INDEX',
              'Ignore Http1xx': healthCheck.ignoreHttp1xx,
            });
            break;
          case 'TCP':
            headerValueMapping = Object.assign(headerValueMapping, {
              'Port': healthCheck.port,
              'Port Index': healthCheck.portIndex,
              'Port Type': healthCheck.portType || 'PORT_INDEX'
            });
            break;
        }

        return (
          <DescriptionList className="nested-description-list"
            hash={headerValueMapping}
            headline={`Health Check ${index + 1} (${healthCheck.protocol})`}
            key={index} />
        );
      });

    return (
      <div className={sectionClassName}>
        <h5 className="inverse flush-top">Health Checks</h5>
        {healthCheckConfigurations}
      </div>
    );
  }

  getLabelSection({labels}) {
    return (
      <DescriptionList className="nested-description-list"
        hash={labels}
        headline="Labels" />
    );
  }

  getEnvironmentVariablesSection({env}) {
    return (
      <DescriptionList className="nested-description-list"
        hash={env}
        headline="Environment Variables" />
    );
  }

  getOtherSection(config) {
    let headerValueMapping = {
      'Constraints': StringUtil.arrayToJoinedString(config.constraints),
      'Dependencies': StringUtil.arrayToJoinedString(config.dependencies),
      'Resource Roles': StringUtil.arrayToJoinedString(config.acceptedResourceRoles),
      'Executor': config.executor,
      'Backoff Factor': config.backoffFactor,
      'Backoff Seconds': config.backoffSeconds,
      'Max Launch Delay': config.maxLaunchDelaySeconds,
      'URIs': StringUtil.arrayToJoinedString(config.uris),
      'User': config.user,
      'Args': StringUtil.arrayToJoinedString(config.args),
      'Version': config.version
    };

    return (
      <DescriptionList className={sectionClassName}
        hash={headerValueMapping}
        headline="Other" />
    );
  }

  render() {
    let {headline, service, versionID} = this.props;
    let config = service.getVersions().get(versionID);

    // Render loading screen
    if (config == null) {
      return (
        <div className="container container-pod text-align-center vertical-center inverse">
          <div className="row">
            <div className="ball-scale">
              <div />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h4 className="inverse" title={versionID}>{headline}</h4>
        {this.getGenralSection(config)}
        {this.getDockerContainerSection(config)}
        {this.getPortDefinitionsSection(config)}
        {this.getHealthChecksSection(config)}
        {this.getLabelSection(config)}
        {this.getEnvironmentVariablesSection(config)}
        {this.getOtherSection(config)}
      </div>
    );
  }
}

ConfigurationView.defaultProps = {
  headline: 'Configuration'
};

ConfigurationView.propTypes = {
  headline: React.PropTypes.string,
  service: React.PropTypes.instanceOf(Service).isRequired,
  versionID: React.PropTypes.string.isRequired
};

module.exports = ConfigurationView;
