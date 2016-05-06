import Item from './Item';
import List from './List';
import ServicePlanBlock from './ServicePlanBlock';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';

class ServicePlanPhase extends Item {
  getBlocks() {
    let items = this.get('blocks').map(function (block) {
      return new ServicePlanBlock(block);
    });

    return new List({items});
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
