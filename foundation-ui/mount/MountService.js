import {EventEmitter} from 'events';
import React from 'react';

let componentStore = {};

/**
 * MountService relies on a single instance of Hooks.
 * It utilses the hooks actions to notify MountPoints of changes and
 * filters to allow external packages to register for and change the content
 * output in the MountPoint
 *
 * @example
 * User of service would listen for updates and possibly change it
 * import {MountService} from 'foundation-ui/mount';
 * MountService.register('myID', 'myNewContent');
 *
 * MountPoint would register itself with the MountService to be able to get
 * updates on registered components
 * import {MountService} from 'foundation-ui/mount';
 * function updateContent(components) {
 *   // Do something with components
 * }
 * MountService.addListener('myID', updateContent);
 */
class MountService extends EventEmitter {
  // Package API
  /**
   * Registers package for updates on this MountPoint id
   * @param  {String} id of MointPoint to register package for
   * @param  {React.Component} component to call when content is being fetched
   * @param  {Number} priority to register package callback with
   * [-Infinity; Infinity]
   */
  register(id, component, priority) {
    if (process.env.NODE_ENV !== 'production') {
      if (component != null && !React.isValidElement(component)) {
        throw new Error(`Provided component ${component} of type '${typeof component}' for mount id: '${id}' is not a valid element. Mount content may only be null, undefined or a valid element.`);
      }
      // TODO: warning registered with same priority
    }

    let components = componentStore[id];
    if (!components) {
      components = componentStore[id] = [];
    }
    components.push({priority, component});
    components.sort(function (a, b) {
      return a.priority - b.priority;
    });
    // Call all actions registered for id.
    // This will call an action for all MountPoints with this id
    // and have them update state by running a new filter
    // (which will include the newly added filter)
    let elements = components.map(function (item) {
      return item.component;
    });
    this.emit(id, elements);
  }

  /**
   * Unregisters package for updates on this MountPoint id
   * @param  {String} id listener is registered with
   * @param  {React.Component} component registered with listener
   */
  unregister(id, component) {
    let components = componentStore[id];
    if (!components) {
      return;
    }

    // Find and remove component from component list at given mount id
    let {length} = components;
    let index = components.findIndex(function (item) {
      return item.component === component;
    });
    while (index > -1) {
      components.splice(index, 1);
      index = components.indexOf(listener, index);
    }

    // Check if there was a change
    if (components.length === length) {
      return;
    }

    // Re-sort the components
    components.sort(function (a, b) {
      return a.priority - b.priority;
    });

    // Have MountPoints run filter again so removed filter will be excluded
    let elements = components.map(function (item) {
      return item.component;
    });
    this.emit(id, elements);
  }
}

module.exports = new MountService();
