import {DCOSStore} from 'foundation-ui';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import HostUtil from '../utils/HostUtil';
import Networking from '../../../../../src/js/constants/Networking';
import Loader from '../../../../../src/js/Loader';
import DescriptionList from '../../../../../src/js/components/DescriptionList';
import Service from '../structs/Service';
import StringUtil from '../../../../../src/js/utils/StringUtil';

const sectionClassName = 'container-fluid container-pod container-pod-super-short flush flush-bottom';
const serviceAddressKey = 'Service Address';

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

  getDockerContainerSection({container, ipAddress}) {
    if (container == null || container.docker == null) {
      return null;
    }

    let {docker} = container;

    let parameters = docker.parameters || [];
    parameters = parameters.map(function ({key, value}) {
      return `${key} : ${value}`;
    });

    let networkNameKey = 'Network Name';
    let headerValueMapping = {
      'Force Pull Image': docker.forcePullImage,
      'Image': docker.image,
      'Network': docker.network,
      [networkNameKey]: null,
      'Parameters': StringUtil.arrayToJoinedString(
        parameters
      ),
      'Privileged': docker.privileged
    };

    if (ipAddress) {
      headerValueMapping[networkNameKey] = ipAddress.networkName;
    } else {
      delete headerValueMapping[networkNameKey];
    }

    return (
      <DescriptionList className={sectionClassName}
        hash={headerValueMapping}
        headline="Docker Container" />
    );
  }

  buildHostName(id, port) {
    let hostname = HostUtil.stringToHostname(id);
    let address = `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
    return (
      <a href={address} target="_blank">{address}</a>
    );
  }

  getVIPPortDefinitionsSection({id, container}) {
    if (container == null || container.docker == null ||
      container.docker.portMappings == null) {
      return null;
    }

    let portMappings = container.docker.portMappings.map(
      (portMapping, index) => {
        let headline = `Port Definition ${index + 1}`;

        if (portMapping.name) {
          headline += ` (${portMapping.name})`;
        }

        let hostPortKey = 'Exposed on Host Network';
        let headerValueMapping = Object.assign(
          {[serviceAddressKey]: null},
          portMapping,
          {[hostPortKey]: 'No'}
        );

        // Check if this port is load balanced
        if (portMapping.containerPort) {
          headerValueMapping[serviceAddressKey] =
            this.buildHostName(id, portMapping.containerPort);
        } else {
          delete headerValueMapping[serviceAddressKey];
        }

        // The value of `hostPort` is typically 0
        if (portMapping.hostPort) {
          headerValueMapping[hostPortKey] = 'Yes';
        }

        return (
          <DescriptionList className="nested-description-list"
            hash={headerValueMapping}
            headline={headline}
            key={index} />
        );
      });

    return (
      <div className={sectionClassName}>
        <h5 className="inverse flush-top">Port Definitions</h5>
        {portMappings}
      </div>
    );
  }

  getPortDefinitionsSection(config) {
    let vipsPortSection = this.getVIPPortDefinitionsSection(config);
    let {id, portDefinitions} = config;

    if (vipsPortSection || portDefinitions == null) {
      return null;
    }

    let portConfigurations = portDefinitions.map(
      (portDefinition, index) => {
        let headline = `Port Definition ${index + 1}`;

        if (portDefinition.name) {
          headline += ` (${portDefinition.name})`;
        }

        let headerValueMapping = Object.assign(
          {[serviceAddressKey]: null},
          portDefinition
        );

        // Check if this port is load balanced
        let hasVIPLabel = portDefinition.labels &&
          Object.keys(portDefinition.labels).find(function (key) {
            return /^VIP_[0-9]+$/.test(key);
          });
        if (hasVIPLabel) {
          headerValueMapping[serviceAddressKey] =
            this.buildHostName(id, portDefinition.port);
        } else {
          delete headerValueMapping[serviceAddressKey];
        }

        return (
          <DescriptionList className="nested-description-list"
            hash={headerValueMapping}
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
              'Command': healthCheck.command.value
            });
            break;
          case 'HTTP':
            headerValueMapping = Object.assign(headerValueMapping, {
              'Path': healthCheck.path,
              'Port': healthCheck.port,
              'Port Index': healthCheck.portIndex,
              'Ignore Http1xx': healthCheck.ignoreHttp1xx
            });
            break;
          case 'TCP':
            headerValueMapping = Object.assign(headerValueMapping, {
              'Port': healthCheck.port,
              'Port Index': healthCheck.portIndex
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
        <div className="container container-fluid container-pod">
          <Loader className="inverse" />
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
