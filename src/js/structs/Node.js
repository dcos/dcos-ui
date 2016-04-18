import Item from './Item';
import UnitHealthUtil from '../utils/UnitHealthUtil';

class Node extends Item {
  getServiceIDs() {
    return this.get('framework_ids');
  }

  isActive() {
    return this.get('active');
  }

  getUsageStats(resource) {
    let total = this.get('resources')[resource];
    let value = this.get('used_resources')[resource];
    let percentage = Math.round(100 * value / Math.max(1, total));

    return {percentage, total, value};
  }

  // Below is Component Health specific API
  // http://schema.dcos/system/health/node

  getHealth() {
    return UnitHealthUtil.getHealth(this.get('health'));
  }

  getOutput() {
    if (typeof this.get('output') === undefined) {
      return 'N/A';
    }

    return this.get('output') || 'OK';
  }

}

module.exports = Node;
