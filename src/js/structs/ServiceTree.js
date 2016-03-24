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

    // Append Marathon groups
    if (options.groups) {
      this.list = this.list.concat(options.groups);
    }

    // Append applications
    if (options.apps) {
      this.list = this.list.concat(options.apps);
    }

    // Converts items into instances of ServiceTree, Application or Framework
    // based on their properties.
    this.list = this.list.map((item) => {
      if (item instanceof ServiceTree) {
        return item;
      }

      // Check item properties and convert items with an items array or an apps
      // and groups array (Marathon group structure) into ServiceTree instances.
      if ((item.items != null && Util.isArray(item.items)) ||
          (item.groups != null && Util.isArray(item.groups) &&
          item.apps != null && Util.isArray(item.apps))) {
        return new this.constructor(
          Object.assign({filterProperties: this.getFilterProperties()}, item)
        );
      }

      // Check the DCOS_PACKAGE_FRAMEWORK_NAME label to determine if the item
      // should be converted to an Application or Framework instance.
      if (item.labels && item.labels.DCOS_PACKAGE_FRAMEWORK_NAME) {
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
