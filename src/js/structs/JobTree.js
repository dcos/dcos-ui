import Job from './Job';
import Tree from './Tree';

module.exports = class JobTree extends Tree {
  /**
   * (Metronome) JobTree
   * @param {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * TODO: DCOS-7369 - Add remove item method
   * @constructor
   * @struct
   */
  constructor({id} = {}) {
    super(...arguments);

    this.id = '';
    if (typeof id == 'string') {
      this.id = id;
    }

    // Converts items into instances of JobTree or Job
    // based on their properties.
    this.list = this.list.map((item) => {
      if (item instanceof Job || item instanceof JobTree) {
        return item
      }

      // Create instances of JobTree for tree like items
      if ((item.items != null && Array.isArray(item.items))
        && !(item instanceof JobTree)) {
        return new this.constructor(
          Object.assign({filterProperties: this.getFilterProperties()}, item)
        );
      }

      // Convert items into instance of Job
      return new Job(item);
    });
  }

  getId() {
    return this.id;
  }

  /**
   * @param {string} id
   * @return {Job|JobTree} matching item
   */
  findItemById(id) {
    return this.findItem(function (item) {
      return item.getId() === id;
    });
  }

  getName() {
    return this.getId().split('.').pop();
  }
};
