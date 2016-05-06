import Item from './Item';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';

class ServicePlanBlock extends Item {
  getID() {
    return this.get('id');
  }

  getName() {
    return this.get('name');
  }

  hasDecisionPoint() {
    return this.get('has_decision_point');
  }

  isComplete() {
    return this.get('status') === ServicePlanStatusTypes.COMPLETE;
  }

  isInProgress() {
    return this.get('status') === ServicePlanStatusTypes.IN_PROGRESS;
  }

  isPending() {
    return this.get('status') === ServicePlanStatusTypes.PENDING;
  }

  isWaiting() {
    return this.get('status') === ServicePlanStatusTypes.WAITING;
  }

}

module.exports = ServicePlanBlock;
