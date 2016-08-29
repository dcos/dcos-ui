import Item from './Item';
import HealthStatus from '../constants/HealthStatus';
import ServiceStatus from '../constants/ServiceStatus';
import VolumeList from './VolumeList';
import ServiceImages from '../constants/ServiceImages';

module.exports = class Service extends Item {
  getId() {
    return this.get('id') || '';
  }

  getName() {
    return this.getId().split('/').pop();
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
    return this.get();
  }
};
