import {EventEmitter} from 'events';
import {CHANGE} from './MountEvent';

/**
 * List of component descriptors
 *
 * @type {Array.<{component:function, priority:Number, type:String}>}
 */
const components = [];

/**
 * Consecutive number used to rank components based on order of registration
 *
 * @type {number}
 */
let rank = 0;

/**
 * MountService
 */
class MountService extends EventEmitter {

  /**
   * Register component with type and optional priority
   *
   * @param {function} component - React component which will be
   * mounted based on the provided type
   * @param {String} type - String which is used to match components with the
   * respective mounts
   * @param {Number} [priority] - Number which is used to sort the components
   */
  registerComponent(component, type, priority = 0) {
    if (typeof component !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        throw new TypeError('Provided component must be a ' +
            'React.Component constructor or a stateless functional component');
      }

      return;
    }

    if (typeof type !== 'string' || type === '') {
      if (process.env.NODE_ENV !== 'production') {
        throw new TypeError('Provided type must be a none empty string');
      }

      return;
    }

    // Add component descriptor and sort components list by priority and rank
    components.push({component, priority, type, rank: rank++});
    components.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      return a.rank - b.rank;
    });

    this.emit(CHANGE, type);
  }

  /**
   * Unregisters component by matching type and component
   *
   * @param  {function} component
   * @param  {String} type
   */
  unregisterComponent(component, type) {
    let i = components.length;
    while (--i >= 0) {
      if (components[i].component === component &&
          components[i].type === type) {
        components.splice(i, 1);
        break;
      }
    }

    this.emit(CHANGE, type);
  }

  /**
   * Find components with matching type
   *
   * @param {String} type
   * @returns {Array} list of matching components ordered by priority
   */
  findComponentsWithType(type) {
    return components.filter((descriptor) => descriptor.type === type)
        .map((descriptor) => descriptor.component);
  }
}

module.exports = new MountService();
