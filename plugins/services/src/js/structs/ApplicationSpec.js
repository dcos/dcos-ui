import {cleanServiceJSON} from '../../../../../src/js/utils/CleanJSONUtil';
import ServiceSpec from './ServiceSpec';
import VolumeConstants from '../constants/VolumeConstants';

module.exports = class ApplicationSpec extends ServiceSpec {
  constructor(spec) {
    super(cleanServiceJSON(spec));
  }

  getAcceptedResourceRoles() {
    return this.get('acceptedResourceRoles');
  }

  getArguments() {
    return this.get('args');
  }

  getCommand() {
    return this.get('cmd');
  }

  getContainerSettings() {
    return this.get('container');
  }

  getConstraints() {
    return this.get('constraints');
  }

  getCpus() {
    return this.get('cpus');
  }

  getDisk() {
    return this.get('disk');
  }

  getEnvironmentVariables() {
    return this.get('env');
  }

  getExecutor() {
    return this.get('executor');
  }

  getFetch() {
    return this.get('fetch');
  }

  getHealthChecks() {
    let healthChecks = this.get('healthChecks') || [];

    // "Clone" health checks to ensure that no one is accidentally altering the
    // properties.
    return healthChecks.map(function (healthCheck) {
      return Object.assign({}, healthCheck);
    });
  }

  getInstancesCount() {
    return this.get('instances');
  }

  getIpAddress() {
    return this.get('ipAddress');
  }

  getLabels() {
    return this.get('labels');
  }

  getMem() {
    return this.get('mem');
  }

  getPortDefinitions() {
    return this.get('portDefinitions');
  }

  getResidency() {
    return this.get('residency');
  }

  getUpdateStrategy() {
    return this.get('updateStrategy');
  }

  getUser() {
    return this.get('user');
  }

  toJSON() {
    let data = Object.assign({}, super.toJSON());
    let containerSettings = this.getContainerSettings();

    // Remove container.docker if we have MESOS containerizer
    if (containerSettings &&
      ((containerSettings.docker && containerSettings.docker.image) ||
      containerSettings.type === VolumeConstants.type.MESOS)
    ) {

      if (data.container.type === VolumeConstants.type.MESOS) {
        delete(data.container.docker);
      }
    }

    return data;
  }

};
