import List from './List';
import ServicePlanBlock from './ServicePlanBlock';

class ServicePlanBlocks extends List {
  constructor() {
    super(...arguments);

    // Cache lookups
    this._activeBlockCount = 0;
    this._activeBlocks = [];

    // Find all blocks where status is active
    this.getItems().forEach((block) => {
      if (!(block instanceof ServicePlanBlock)) {
        block = new ServicePlanBlock(block);
      }

      if (block.isInProgress()) {
        this._activeBlocks.push(block);
      }
    });

    this._activeBlockCount = this._activeBlocks.length;
  }

  getActive() {
    if (this._activeBlockCount === 0) {
      return null;
    }

    return this._activeBlocks;
  }

  getActiveBlockCount() {
    return this._activeBlockCount;
  }

}

module.exports = ServicePlanBlocks;
