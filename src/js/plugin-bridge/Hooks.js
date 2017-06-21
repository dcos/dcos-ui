function addListener(store, hook, listener, priority = 10) {
  if (typeof priority !== "number") {
    priority = 10;
  }

  if (store[hook] === undefined) {
    store[hook] = {};
  }

  if (store[hook][priority] === undefined) {
    store[hook][priority] = [];
  }

  store[hook][priority].push(listener);
}

function removeListener(store, hook, listener) {
  if (store == null || typeof store[hook] !== "object") {
    return;
  }

  // Find and remove listener in hook values
  Object.values(store[hook]).forEach(function(listeners) {
    if (!Array.isArray(listeners)) {
      return;
    }

    let index = listeners.indexOf(listener);
    while (index > -1) {
      listeners.splice(index, 1);
      index = listeners.indexOf(listener, index);
    }
  });
}
/*
 * Example usage:
 *
 * import Hooks from './Hooks';
 * const hooks = new Hooks();
 *
 * // Register actions and filters;
 * hooks.addAction('someAction', function actionHandler() {
 *   // Do something on action fired
 * });
 * hooks.addFilter('someFilter', function filterHandler(value) {
 *   // Change value on filter applied
 *   return value.replace('some', 'someChanged');
 * });
 *
 * // Call actions and filters
 * hooks.doAction('someAction');
 * hooks.applyFilter('someFilter', 'someValue');
 */
module.exports = function Hooks() {
  return {
    // Event store for actions
    actions: {},

    // Event store for filters
    filters: {},

    /**
     * Attaches listener for filter
     *
     * @param  {String} hook The event id to listen for
     * @param  {Function} listener Callback to fire when event executes
     * @param  {Number} priority Priority for listener
     */
    addFilter(hook, listener, priority) {
      addListener(this.filters, hook, listener, priority);
    },

    /**
     * Removes listener for filter
     *
     * @param  {String} hook The event id to listen for
     * @param  {Function} listener Callback to fire when event executes
     */
    removeFilter(hook, listener) {
      removeListener(this.filters, hook, listener);
    },

    /**
     * Will apply all filters for a given hook
     * If more arguments are passed to the function these arguments will
     * be passed down to the listeners. But we only expect `value` to be
     * modified.
     *
     * @param  {String} hook An event identifier
     * @param  {Mixed} value The value that is being filtered
     * @return {Mixed} The filtered value after all hooked functions are applied
     */
    applyFilter(hook, value, ...args) {
      let listeners = this.filters[hook];

      // If there's no listeners, then return early
      if (listeners == null || listeners.length === 0) {
        return value;
      }

      // Clone listeners, this will guarantee they all get called
      listeners = Object.assign({}, listeners);

      // Sort the listeners by priority
      const priorities = Object.keys(listeners);
      priorities.sort();

      priorities.forEach(function(priority) {
        // Clone and call all listeners
        listeners[priority].slice(0).forEach(function(listener) {
          // Creates new arguments array to call the listener with
          const groupedArgs = args.slice();
          groupedArgs.unshift(value);
          value = listener.apply(null, groupedArgs);
        });
      });

      return value;
    },

    /**
     * Attaches listener for action
     *
     * @param  {String} hook The event id to listen for
     * @param  {Function} listener Callback to fire when event executes
     * @param  {Number} priority Priority for listener
     */
    addAction(hook, listener, priority) {
      addListener(this.actions, hook, listener, priority);
    },

    /**
     * Removes listener for action
     *
     * @param  {String} hook The event id to listen for
     * @param  {Function} listener Callback to fire when event executes
     */
    removeAction(hook, listener) {
      removeListener(this.actions, hook, listener);
    },

    /**
     * Will apply all filters for a given hook
     * If more arguments are passed to the function these arguments will
     * be passed down to the listeners. But we only expect `value` to be
     * modified.
     *
     * @param  {String} hook An event identifier
     */
    doAction(hook, ...args) {
      let listeners = this.actions[hook];

      // If there's no listeners, then return early
      if (listeners == null || listeners.length === 0) {
        return;
      }

      // Clone listeners, this will guarantee they all get called
      listeners = Object.assign({}, listeners);

      // Sort the listeners by priority
      const priorities = Object.keys(listeners);
      priorities.sort();

      priorities.forEach(function(priority) {
        // Clone and call all listeners
        listeners[priority].slice(0).forEach(function(listener) {
          listener.apply(null, args);
        });
      });
    }
  };
};
