import Tree from './Tree';
import Job from './Job';

module.exports = class JobTree extends Tree {
  /**
   * (Chronos) JobTree
   * @param {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * @constructor
   * @struct
   */
  constructor(options = {}) {
    super(options);

    this.id = '/';
    if (options && typeof options.id == 'string') {
      this.id = options.id;
    }

    this.map = new WeakMap();
  }

  /**
   *
   * @param {JobTree|Job} item
   */
  add(item) {
    if (!(item instanceof Job || item instanceof JobTree)) {
      throw new TypeError('item is neither an instance of Job nor JobTree');
    }

    if (!item.getId().startsWith(this.getId())) {
      throw new Error(
        `item id (${item.getId()})  doesn't match tree id (${this.getId()})`
      );
    }

    // Check if the item is already present in the tree (including sub trees)
    if (this.findItemById(item.getId())) {
      // TODO (orlandohohmeier): Update item (type Job) data
      return;
    }

    let [parentId] = item.getId().match(/^\/[^/]+/);

    // Add item to the current tree if it's the actual parent tree
    if (this.getId() === parentId) {
      super.add(item);
      return;
    }

    // Find or create corresponding parent tree
    let parent = this.findItemById(parentId);
    if (!parent) {
      parent = new this.constructor({id: parentId});
      super.add(parent);
    }

    // Add item to parent tree
    parent.add(item);
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
    return this.getId().split('/').pop();
  }
};
