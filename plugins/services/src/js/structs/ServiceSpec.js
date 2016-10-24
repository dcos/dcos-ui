import Item from '../../../../../src/js/structs/Item';

module.exports = class ServiceSpec extends Item {
  getId() {
    return this.get('id') || '';
  }

  toJSON() {
    return this.get();
  }
};
