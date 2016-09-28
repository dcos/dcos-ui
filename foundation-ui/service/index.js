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
