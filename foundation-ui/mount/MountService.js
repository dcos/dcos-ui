import React from 'react';

import Hooks from '../hooks';

const hooks = Hooks();

/**
 * MountService relies on a single instance of Hooks.
 * It utilses the hooks actions to notify MountPoints of changes and
 * filters to allow external packages to register for and change the content
 * output in the MountPoint
 *
 * @example
 * User of service would listen for updates and possibly change it
 * import {MountService} from 'foundation-ui/mount';
 * MountService.register('myID', function (value) {
 *   return value.replace('my', 'myChanged');
 * });
 *
 * MountPoint would register itself with the MountService to be able to get
 * updates on content
 * import {MountService} from 'foundation-ui/mount';
 * function updateContent() {
 *   let newContent = MountService.getContent(
 *     'myID',
 *     React.Children.toArray(children),
 *     props
 *   );
 *
 *   // Do something with newContent
 * }
 * MountService.addListener('myID', updateContent);
 */
const MountService = {
  // Package API
  /**
   * Registers package for updates on this MountPoint id
   * @param  {String} id of MointPoint to register package for
   * @param  {Function} callback to call when content is being fetched
   * @param  {Number} priority to register package callback with
   * [-Infinity; Infinity]
   */
  register(id, callback, priority) {
    hooks.addFilter(id, callback, priority);
    // Call all actions registered for id.
    // This will call an action for all MountPoints with this id
    // and have them update state by running a new filter
    // (which will include the newly added filter)
    hooks.doAction(id);
  },

  /**
   * Unregisters package for updates on this MountPoint id
   * @param  {String} id listener is registered with
   * @param  {Function} callback registered with listener
   */
  unregister(id, callback) {
    hooks.removeFilter(id, callback);
    // Have MountPoints run filter again so removed filter will be excluded
    hooks.doAction(id);
  },

  // MountPoint API
  /**
   * Register for changes in MountService specific to the given id.
   * Whenever MountService has a change it invoke callback
   * so we can get the newly filtered children.
   * @param {String} id to listen for events
   * @param {Function} callback to call when event fires
   * @param {Number} priority of callback [-Infinity; Infinity]
   */
  addListener(id, callback, priority) {
    hooks.addAction(id, callback, priority);
  },

  /**
   * Removes listener for changes in MountService specific to the given id.
   * @param  {String} id listener is registered with
   * @param  {Function} callback registered with the id
   */
  removeListener(id, callback) {
    hooks.removeAction(id, callback);
  },

  /**
   * Function to retrieve content for a given id
   * @param  {String} id
   * @param  {Component} defaultContent to be displayed if filter returns
   * undefined or null
   * @param  {Object} props to pass to content
   * @return  {Component} content to be displayed in MountPoint
   */
  getContent(id, defaultContent, props) {
    let content = hooks.applyFilter(id, defaultContent, props);
    if (process.env.NODE_ENV !== 'production') {
      if (content != null && !React.isValidElement(content) && !Array.isArray(content)) {
        throw new Error(`After applying filter content resulted in ${content} of type '${typeof content}' for mount id: '${id}'. Content may only be null, undefined, a valid element, or an array of valid elements.`);
      }
    }

    return content;
  }
};

module.exports = MountService;
