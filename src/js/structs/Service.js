import Item from './Item';

module.exports = class Service extends Item {
  getId() {
    return this.get('id') || '';
  }

  toJSON() {
    return this.get();
  }
};
