import React from 'react';

import Hooks from '../hooks';

const hooks = Hooks();

/**
 * AuthService relies on a single instance of Hooks.
 * It utilses the hooks actions to notify AuthPoints of changes and
 * filters to allow external packages to register for and change the content
 * output in the AuthPoint
 *
 * @example
 * User of service would listen for updates and possibly change it
 * import {AuthService} from 'foundation-ui/mount';
 * AuthService.register('myID', function (value) {
 *   return value.replace('my', 'myChanged');
 * });
 *
 * AuthPoint would register itself with the AuthService to be able to get
 * updates on content
 * import {AuthService} from 'foundation-ui/mount';
 * function updateContent() {
 *   let newContent = AuthService.getContent(
 *     'myID',
 *     React.Children.toArray(children),
 *     props
 *   );
 *
 *   // Do something with newContent
 * }
 * AuthService.addListener('myID', updateContent);
 */
const AuthService = {
  // Package API
  /**
   * Registers package for updates on this AuthPoint permission
   * @param  {String} permission of MointPoint to register package for
   * @param  {Function} callback to call when content is being fetched
   * @param  {Number} priority to register package callback with
   */
  register(permission, callback, priority) {
    hooks.addFilter(permission, callback, priority);
    // Call all actions registered for permission.
    // This will call an action for all AuthPoints with this permission
    // and have them update state by running a new filter
    // (which will include the newly added filter)
    hooks.doAction(permission);
  },

  /**
   * Unregisters package for updates on this AuthPoint permission
   * @param  {String} permission listener is registered with
   * @param  {Function} callback registered with listener
   */
  unregister(permission, callback) {
    hooks.removeFilter(permission, callback);
    // Have AuthPoints run filter again so removed filter will be excluded
    hooks.doAction(permission);
  },

  // Mount API
  /**
   * Register for changes in AuthService specific to the given permission.
   * Whenever AuthService has a change it invoke callback
   * so we can get the newly filtered children.
   * @param {String} permission to listen for events
   * @param {Function} callback to call when event fires
   * @param {Number} priority of callback [-Infinity; Infinity]
   */
  addListener(permission, callback, priority) {
    hooks.addAction(permission, callback, priority);
  },

  /**
   * Removes listener for changes in AuthService specific to the given permission.
   * @param  {String} permission listener is registered with
   * @param  {Function} callback registered with the permission
   */
  removeListener(permission, callback) {
    hooks.removeAction(permission, callback);
  },

  /**
   * Function to retrieve content for a given permission
   * @param  {String} permission
   * @param  {Component} content to be displayed if filter returns
   * undefined or null
   * @return  {Component} content to be displayed in AuthPoint
   */
  isAuthorized(permission, defaultValue, props) {
    // Some logic like looking at a cache of user permissions and determining
    // if they should see this component.
    // if (!acls.contains(permission)) {
    //   return null;
    // }
    let filteredValue = hooks.applyFilter(permission, defaultValue, props);
    if (process.env.NODE_ENV !== 'production') {
      if (typeof filteredValue !== 'boolean') {
        throw new Error(`After applying filter authorized value resulted in ${filteredValue} of type '${typeof filteredValue}' for permission (auth id): '${permission}'. Value must be a boolean value.`);
      }
    }

    return filteredValue;
  }
};

module.exports = AuthService;
