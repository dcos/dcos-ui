import {cleanServiceJSON} from '../utils/CleanJSONUtil';
import Item from './Item';
import HealthStatus from '../constants/HealthStatus';
import ServiceImages from '../constants/ServiceImages';
import ServiceStatus from '../constants/ServiceStatus';
import ServiceSpec from './ServiceSpec';
import VolumeList from './VolumeList';

module.exports = class Service extends Item {
  getId() {
    return this.get('id') || '';
  }

  getName() {
    return this.getId().split('/').pop();
  }

  getSpec() {
    return new ServiceSpec(this.get());
  }

  getHealth() {
    return HealthStatus.NA;
  }

  getLabels() {
    return {};
  }

  getVolumes() {
    return new VolumeList({items: []});
  }

  getStatus() {
    const status = this.getServiceStatus();
    if (status.displayName == null) {
      return null;
    }

    return status.displayName;
  }

  getServiceStatus() {
    return ServiceStatus.NA;
  }

  getImages() {
    return ServiceImages.NA_IMAGES;
  }

  getWebURL() {
    return null;
  }

  getInstancesCount() {
    return 0;
  }

  getTasksSummary() {
    return {
      tasksHealthy: 0,
      tasksStaged: 0,
      tasksUnhealthy: 0,
      tasksUnknown: 0,
      tasksOverCapacity: 0,
      tasksRunning: 0
    };
  }

  getResources() {
    return {
      cpus: 0,
      mem: 0,
      disk: 0
    };
  }

  toJSON() {
    return cleanServiceJSON(this.get());
  }
};
