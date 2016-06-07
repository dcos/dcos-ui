import List from './List';
import ServicePlanBlock from './ServicePlanBlock';

class ServicePlanBlocks extends List {
  constructor() {
    super(...arguments);

    // Cache lookups
    this._activeBlocks = [];
    this._completeBlocks = [];

    // Find all blocks where status is active
    this.list = this.getItems().map((block) => {
      if (!(block instanceof ServicePlanBlock)) {
        block = new ServicePlanBlock(block);
      }

      if (block.isInProgress()) {
        this._activeBlocks.push(block);
      }

      if (block.isComplete()) {
        this._completeBlocks.push(block);
      }

      return block;
    });
  }

  getActive() {
    return this._activeBlocks;
  }

  getComplete() {
    return this._completeBlocks;
  }

}

module.exports = ServicePlanBlocks;
