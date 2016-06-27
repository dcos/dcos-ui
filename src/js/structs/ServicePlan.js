import Item from './Item';
import ServicePlanPhases from './ServicePlanPhases';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';

class ServicePlan extends Item {
  getPhases() {
    return new ServicePlanPhases({items: this.get('phases')});
  }

  getErrors() {
    return this.get('errors') || [];
  }

  getStatus() {
    return this.get('status');
  }

  hasError() {
    return this.getStatus() === ServicePlanStatusTypes.ERROR;
  }

  isComplete() {
    return this.getStatus() === ServicePlanStatusTypes.COMPLETE;
  }

  isInProgress() {
    return this.getStatus() === ServicePlanStatusTypes.IN_PROGRESS;
  }

  isPending() {
    return this.getStatus() === ServicePlanStatusTypes.PENDING;
  }

  isWaiting() {
    return this.getStatus() === ServicePlanStatusTypes.WAITING;
  }
}

module.exports = ServicePlan;
