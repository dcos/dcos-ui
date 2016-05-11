import Item from './Item';
import ServicePlanBlocks from './ServicePlanBlocks';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';

class ServicePlanPhase extends Item {
  getBlocks() {
    return new ServicePlanBlocks({items: this.get('blocks')});
  }

  getID() {
    return this.get('id');
  }

  getName() {
    return this.get('name');
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

module.exports = ServicePlanPhase;
