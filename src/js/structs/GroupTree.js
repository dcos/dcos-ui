import StringUtil from '../utils/StringUtil';
import Tree from './Tree';
import Item from './Item';
import Service from './Service';

module.exports = class GroupTree extends Tree {
  /**
   * (Marathon) GroupTree
   *
   * todo (orlandohohmeier): overwrite filter to make it actually work. :)
   *
   * @param {{
   *          id:string,
   *          items:array<({id:string, items:array|*)>,
   *          groups:array<({id:string, groups:array, apps:array}|*)>,
   *          apps:array
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

    if (!options.apps || !options.groups) {
      throw new Error(`Expected an array. ${JSON.stringify(options)}`);
    }

    // Replace groups with instances of (Marathon) GroupTree
    this.list = options.groups.map((item) => {
      if (!(item instanceof GroupTree)) {
        return new this.constructor(
          Object.assign({filterProperties: this.getFilterProperties()}, item)
        );
      }

      return item;
    });

    // Replace items instances of Services
    this.list = this.list.concat(options.apps.map((item) => {
      if (item instanceof Service) {
        return item;
      }

      return new Service(item);
    }));
  }

  getId() {
    return this.id;
  }

  getName() {
    var tokens = this.getId().split('/');
    return tokens[tokens.length - 1];
  }

};
