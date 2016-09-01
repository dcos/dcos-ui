import Item from './Item';

module.exports = class ServiceSpec extends Item {
  getId() {
    return this.get('id') || '';
  }

  toJSON() {
    return this.get();
  }
};
