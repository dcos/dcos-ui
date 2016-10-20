import React from 'react';

import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import EnvironmentList from '../../../../../../src/js/components/EnvironmentList';
import ServiceConfigUtil from '../../utils/ServiceConfigUtil';
import Util from '../../../../../../src/js/utils/Util';

class PodContainerSpecView extends React.Component {
  getArtifactsSection() {
    let {container: {artifacts}} = this.props;

    if (!artifacts || artifacts.length === 0) {
      return null;
    }

    let keysMapping = {
      uri: 'URI',
      extract: 'Extract',
      executable: 'Executable',
      cache: 'Cache',
      destPath: 'Destination Path'
    };

    let nodes = artifacts.map(function (artifact, i) {
      return (
        <DescriptionList
          key={i}
          hash={artifact}
          renderKeys={keysMapping} />
      );
    });

    return (
      <div>
        <h5 className="flush-top">
          Artifacts
        </h5>
        {nodes}
      </div>
    );
  }

  getGeneralDetails() {
    let hash = Util.omit(this.props.container, [
      'endpoints',
      'artifacts',
      'volumeMounts',
      'environment'
    ]);

    // Unwrap command
    if (hash.exec) {
      hash.command = ServiceConfigUtil.getCommandString(hash);
      delete hash.exec;
    }

    let keysMapping = {
      name: 'Name',
      cpus: 'CPUs',
      gpus: 'GPUs',
      mem: 'Memory (MiB)',
      disk: 'Disk Space (Mib)',
      command: 'Command',
      gracePeriodSeconds: 'Grace Period (seconds)',
      intervalSeconds: 'Interval (seconds)',
      maxConsecutiveFailures: 'Max Consecutive Failures',
      timeoutSeconds: 'Timeout (seconds)',
      delaySeconds: 'Delay (seconds)',
      killGracePeriodSeconds: 'SIGKILL Grace Period (seconds)'
    };

    return <DescriptionList hash={hash} renderKeys={keysMapping} />;
  }

  getEnvironmentSection() {
    let {container: {environment}} = this.props;

    if (!environment || Object.keys(environment).length === 0) {
      return null;
    }

    return (
      <div>
        <h5 className="flush-top">Environment Variables</h5>
        <EnvironmentList environment={environment} />
      </div>
    );
  }

  getEndpointsSection() {
    let {container: {endpoints}} = this.props;

    if (!endpoints || !endpoints.length) {
      return null;
    }

    let nodes = endpoints.map(function (endpoint, index) {
      let headline = `Endpoint ${index + 1}`;

      if (endpoint.name) {
        headline += ` (${endpoint.name})`;
      }

      return (
        <DescriptionList className="nested-description-list"
          hash={endpoint}
          headline={headline}
          key={index} />
      );
    });

    return (
      <div>
        <h5 className="flush-top">Endpoints</h5>
        {nodes}
      </div>
    );
  }

  getVolumesSection() {
    let {container: {volumeMounts}} = this.props;

    if (!volumeMounts || volumeMounts.length === 0) {
      return null;
    }

    let keysMapping = {
      name: 'Name',
      mountPath: 'Mount Path',
      readOnly: 'Read Only'
    };

    let nodes = volumeMounts.map(function (volumeMount, i) {
      return (
        <DescriptionList
          key={i}
          hash={volumeMount}
          renderKeys={keysMapping} />
      );
    });

    return (
      <div>
        <h5 className="flush-top">
          Volume Mounts
        </h5>
        {nodes}
      </div>
    );
  }

  render() {
    let {container: {name}} = this.props;

    return (
      <div className="pod-config-container">
        <h5 className="flush-top">
          {name}
        </h5>
        {this.getGeneralDetails()}
        {this.getEnvironmentSection()}
        {this.getArtifactsSection()}
        {this.getVolumesSection()}
        {this.getEndpointsSection()}
      </div>
    );
  }
};

PodContainerSpecView.propTypes = {
  container: React.PropTypes.object.isRequired
};

module.exports = PodContainerSpecView;
