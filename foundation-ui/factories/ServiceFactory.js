/*
  Service Factory
 */
function ServiceFactory(hooks) {
  return {
    on(mountId /* , callback */) {
      hooks.addFilter(...arguments);
      // Call all actions registered for mountId. This will call an action all all Mounts
      // with this mountId and have them update state by running a new filter (which will include the newly added filter)
      hooks.doAction(mountId);
    },

    removeListener(mountId /* , callback */) {
      hooks.removeFilter(...arguments);
      // Have Mount's run filter again so removed filter will be excluded
      hooks.doAction(mountId);
    }
  };
}

module.exports = ServiceFactory;
