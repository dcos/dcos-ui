import Job from './Job';
import Tree from './Tree';

module.exports = class JobTree extends Tree {
  /**
   * (Chronos) JobTree
   * @param {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * TODO: DCOS-7369 - Add remove item method
   * @constructor
   * @struct
   */
  constructor({id, items, filterProperties} = {}) {
    super({filterProperties});

    this.id = '/';

    if (typeof id == 'string') {
      if (id !== '/' && (!id.startsWith('/') || id.endsWith('/'))) {
        throw new Error(`Id (${id}) must start with a leading slash ("/") ` +
          'and should not end with a slash, except for root id which is only ' +
          'a slash.');
      }

      this.id = id;
    }

    // Parse and add items to the current tree
    if (Array.isArray(items)) {
      items.forEach((item)=> {
        // Create instances of JobTree for tree like items and add them
        if ((item.items != null && Array.isArray(item.items))
          && !(item instanceof JobTree)) {
          this.add(new this.constructor(
            Object.assign({filterProperties: this.getFilterProperties()}, item)
          ));

          return;
        }

        // Convert items into instance of Job and add them to the current tree
        if (!(item instanceof Job) && !(item instanceof JobTree)) {
          this.add(new Job(item));

          return;
        }

        this.add(item);
      })
    }
  }

  /**
   * Add item - This method will create sub trees if needed to insert the item
   * at the correct location (based on id/path matching).
   * @param {JobTree|Job} item
   */
  add(item) {
    if (!(item instanceof Job || item instanceof JobTree)) {
      throw new TypeError('item is neither an instance of Job nor JobTree');
    }

    const itemId = item.getId();

    if (!itemId.startsWith(this.getId())) {
      throw new Error(
        `item id (${itemId}) doesn't match tree id (${this.getId()})`
      );
    }

    // Check if the item is already present in the tree (including sub trees)
    if (this.findItemById(itemId)) {
      // TODO: DCOS-7370 - Update item (type Job) data
      return;
    }

    // Get the parent id (e.g. /group) by matching every thing but the item
    // name including the preceding slash "/" (e.g. /id).
    const [parentId] = itemId.match(/\/.*?(?=\/?[^/]+\/?$)/);

    // Add item to the current tree if it's the actual parent tree
    if (this.getId() === parentId) {
      super.add(item);
      return;
    }

    // Find or create corresponding parent tree and add it to the tree
    let parent = this.findItemById(parentId);
    if (!parent) {
      parent = new this.constructor({id: parentId});
      this.add(parent);
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
