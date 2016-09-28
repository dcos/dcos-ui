/**
 * Service is a factory for creating services that relies on a single instance
 * of Hooks. It utilses the hooks actions to notify subscribers of changes and
 * filters to allow external packages to change output from the service
 * @param  {Hooks} hooks, an instance of Hooks
 * @returns {Service} service, an instance of Service
 *
 * @example
 * User of service would listen for updates and possibly change it
 * service.on('myID', function (value) {
 *   return value.replace('my', 'myChanged');
 * });
 *
 * Creater of service would instantiate the Hooks and apply filter when necessary
 * let hooks = Hooks();
 * let service = Service(hooks);
 * hooks.applyFilter('myID', function (value) {
 *   return 'myValue';
 * });
 */
function Service(hooks) {
  return {
    on(id, callback, priority) {
      hooks.addFilter(id, callback, priority);
      // Call all actions registered for id.
      // This will call an action for all Mounts with this id
      // and have them update state by running a new filter
      // (which will include the newly added filter)
      hooks.doAction(id);
    },

    removeListener(id, callback) {
      hooks.removeFilter(id, callback);
      // Have Mount's run filter again so removed filter will be excluded
      hooks.doAction(id);
    }
  };
}

module.exports = Service;
