import Item from './Item';
import PodContainerStatus from '../constants/PodContainerStatus';
import StringUtil from '../utils/StringUtil';

module.exports = class PodContainer extends Item {
  getContainerStatus() {
    switch (this.get('status')) {
      case 'RUNNING':
        if (this.hasHealthChecks()) {
          if (this.isHealthy()) {
            return PodContainerStatus.HEALTHY;
          } else {
            return PodContainerStatus.UNHEALTHY;
          }
        } else {
          return PodContainerStatus.RUNNING;
        }

      case 'ERROR':
        return PodContainerStatus.ERROR;

      case 'FAILED':
        return PodContainerStatus.FAILED;

      case 'FINISHED':
        return PodContainerStatus.FINISHED;

      case 'KILLED':
        return PodContainerStatus.KILLED;

      default:
        return Object.assign(Object.create(PodContainerStatus.NA), {
          displayName: StringUtil.capitalize(this.get('status').toLowerCase())
        });
    }
  }

  getEndpoints() {
    return this.get('endpoints') || [];
  }

  hasHealthChecks() {
    // According to RAML specs:
    //
    // https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/container-status.raml#L49
    // 'healthy: should only be present if a health check is defined for this endpoint'
    //
    return this.getEndpoints().some(function (ep) {
      return ep.healthy !== undefined;
    });
  }

  isHealthy() {
    return this.getEndpoints().every(function (ep) {
      return ep.healthy === undefined || ep.healthy;
    });
  }
};
