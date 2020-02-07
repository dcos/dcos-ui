import Tree from "#SRC/js/structs/Tree";

export default class PermissionTree extends Tree {
  /**
   * PermissionTree
   * @param {{
   *          rid:string,
   *          name:string,
   *          items:array<({rid:string, items:array}|*)>,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * @constructor
   * @struct
   */
  constructor(options = {}) {
    super(options);

    this._actions = options.actions;
    this._displayName = options.displayName;
    this._groupName = options.groupName;
    this._rid = options.rid;

    // Converts items into instances of PermissionTree,
    // even if they have no items property.
    this.list = this.list.map(item => {
      if (item instanceof PermissionTree) {
        return item;
      }

      return new this.constructor({
        filterProperties: this.getFilterProperties(),
        ...item
      });
    });

    // Don't add items if not present in options
    if (!Object.prototype.hasOwnProperty.call(options, "items")) {
      delete this.list;
    }
  }

  get actions() {
    return this._actions;
  }

  get groupName() {
    return this._groupName || this.name;
  }

  get name() {
    return this._displayName || this.rid; // Fallback to rid
  }

  get rid() {
    return this._rid;
  }

  collectActions(rids) {
    return this.collectChildren(rids).reduce((actions, item) => {
      if (Array.isArray(item.actions)) {
        return actions.concat(item.actions);
      }

      return actions;
    }, []);
  }

  collectChildren(rids = []) {
    const items = [this];
    rids.reduce((current, rid) => {
      const next = current.getItems().find(item => item.rid === rid);

      if (!(next instanceof PermissionTree)) {
        return current;
      }

      items.push(next);

      return next;
    }, this);

    return items;
  }

  collectPermissionString(rids) {
    return this.collectChildren(rids)
      .map(item => item.rid)
      .join(":");
  }
}
