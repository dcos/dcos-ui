import Item from './Item';

module.exports = class Job extends Item {
  getId() {
    return this.get('id');
  }

  getName() {
    return this.getId().split('/').pop();
  }

};
