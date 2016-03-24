import Application from './Application';
import Framework from './Framework';
import Tree from './Tree';
import Util from '../utils/Util';

module.exports = class ServiceTree extends Tree {
  /**
   * (Marathon) ServiceTree
   * @param {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   *          groups:array<({id:string, groups:array, apps:array}|*)>,
   *          apps:array,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * @constructor
   * @struct
   */
  constructor(options = {}) {
    super(options);

    this.id = '/';
    if (options.id || typeof options.id == 'string') {
      this.id = options.id;
    }

    // Replace groups with instances of (Marathon) ServiceTree and append them
    // to item list/tree
    if (options.groups) {
      this.list = this.list.concat(options.groups.map((item) => {
        if (!(item instanceof ServiceTree)) {
          return new this.constructor(
            Object.assign({filterProperties: this.getFilterProperties()}, item)
          );
        }

        return item;
      }));

    }

    // Append apps to item list/tree
    if (options.apps) {
      this.list = this.list.concat(options.apps);
    }

    // Replace group tree like items instances of ServiceTree and replace items
    // with instance of Service
    this.list = this.list.map((item) => {
      if (item instanceof ServiceTree) {
        return item;
      }

      if ((item.items != null && Util.isArray(item.items)) ||
          (item.groups != null && Util.isArray(item.groups) &&
          item.apps != null && Util.isArray(item.apps))) {
        return new this.constructor(
          Object.assign({filterProperties: this.getFilterProperties()}, item)
        );
      }

      // Check the label DCOS_PACKAGE_FRAMEWORK_NAME which contains a string.
      if (item.labels && item.labels.DCOS_PACKAGE_FRAMEWORK_NAME != null) {
        return new Framework(item);
      } else {
        return new Application(item);
      }
    });
  }

  getId() {
    return this.id;
  }

  getName() {
    var tokens = this.id.split('/');
    return tokens[tokens.length - 1];
  }
};
