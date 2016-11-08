import {EventEmitter} from 'events';
import {CHANGE} from './MountEvent';

/**
 * List of component descriptors
 * @type {Array.<{component:function, priority:Number, role:String}>}
 */
const components = [];

/**
 * MountService
 */
class MountService extends EventEmitter {

  /**
   * Register component with role and optional priority
   *
   * @param {String} role - String which is used to match components with the
   * respective mounts
   * @param {function} component - React component which will be
   * mounted based on the provided role
   * @param {Number} [priority] - Number which is used to sort the components
   */
  registerComponent(role, component, priority = 0) {
    if (typeof component !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        throw new TypeError('Provided component must be a ' +
            'React.Component constructor or a stateless functional component');
      }

      return;
    }

    if (typeof role !== 'string' || role === '') {
      if (process.env.NODE_ENV !== 'production') {
        throw new TypeError('Provided role must be a none empty string');
      }

      return;
    }

    // Add component descriptor and sort list of components
    components.push({component, priority, role});
    components.sort((a, b) => a.priority - b.priority);

    this.emit(CHANGE, role);
  }

  /**
   * Unregisters component by matching role and component
   *
   * @param  {String} role
   * @param  {React.Component} component
   */
  unregisterComponent(role, component) {
    let i = components.length;
    while (--i >= 0) {
      if (components[i].component === component &&
          components[i].role === role) {
        components.splice(i, 1);
        break;
      }
    }

    this.emit(CHANGE, role);
  }

  /**
   * Find components with matching role
   *
   * @param {String} role
   * @returns {Array} list of matching components ordered by priority
   */
  findComponentsWithRole(role) {
    return components.filter((descriptor) => descriptor.role === role)
        .map((descriptor) => descriptor.component);
  }
}

module.exports = new MountService();
