import { EventEmitter } from "events";
import { CHANGE } from "./MountEvent";

/**
 * MountService
 */
class MountService extends EventEmitter {
  constructor() {
    super(...arguments);

    /**
     * Private Context
     *
     * @typedef {Object} MountService~Context
     * @property {MountService} instance - Current mount service instance
     * @property {Array.<{component:function, priority:Number, type:String}>}
     *     components -  List of component descriptors
     * @property {number} rank - Consecutive number used to rank components
     *     based on order of registration
     */
    const context = {
      components: [],
      instance: this,
      rank: 0
    };

    this.registerComponent = this.registerComponent.bind(context);
    this.unregisterComponent = this.unregisterComponent.bind(context);
    this.findComponentsWithType = this.findComponentsWithType.bind(context);
  }

  /**
   * Register component with type and optional priority
   *
   * @this MountService~Context
   * @param {function} component - React component which will be
   * mounted based on the provided type
   * @param {String} type - String which is used to match components with the
   * respective mounts
   * @param {Number} [priority] - Number which is used to sort the components
   */
  registerComponent(component, type, priority = 0) {
    let { components, instance, rank } = this;

    if (typeof component !== "function") {
      if (global.__DEV__) {
        throw new TypeError(
          "Provided component must be a " +
            "React.Component constructor or a stateless functional component"
        );
      }

      return;
    }

    if (typeof type !== "string" || type === "") {
      if (global.__DEV__) {
        throw new TypeError("Provided type must be a none empty string");
      }

      return;
    }

    if (
      components.find(
        descriptor =>
          descriptor.component === component && descriptor.type === type
      )
    ) {
      if (global.__DEV__) {
        throw new Error(
          "Provided component/type combination is already registered"
        );
      }

      return;
    }

    // Add component descriptor and sort components list by priority and rank
    components.push({ component, priority, type, rank: rank++ });
    components.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      return a.rank - b.rank;
    });

    instance.emit(CHANGE, type);
  }

  /**
   * Unregisters component by matching type and component
   *
   * @this MountService~Context
   * @param  {function} component
   * @param  {String} type
   */
  unregisterComponent(component, type) {
    const { components, instance } = this;

    let i = components.length;
    while (--i >= 0) {
      if (
        components[i].component === component &&
        components[i].type === type
      ) {
        components.splice(i, 1);
        break;
      }
    }

    instance.emit(CHANGE, type);
  }

  /**
   * Find components with matching type
   *
   * @this MountService~Context
   * @param {String} type
   * @returns {Array} list of matching components ordered by priority
   */
  findComponentsWithType(type) {
    const { components } = this;

    return components
      .filter(descriptor => descriptor.type === type)
      .map(descriptor => descriptor.component);
  }
}

module.exports = MountService;
