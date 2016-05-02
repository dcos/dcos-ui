import Events from 'events';

import {PLUGINS_CONFIGURED} from '../constants/EventTypes';

function addListener(store, hook, listener, priority = 10) {
  if (typeof priority !== 'number') {
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

module.exports = Object.assign({}, Events.EventEmitter.prototype, {
  // Event store for actions
  actions: {},

  // Event store for filters
  filters: {},

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  notifyPluginsLoaded() {
    this.doAction('pluginsConfigured');
    this.emit(PLUGINS_CONFIGURED);
  },

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

    // Sort the listeners by priority
    let priorities = Object.keys(listeners);
    priorities.sort();

    priorities.forEach(function (priority) {
      // Call all listeners
      listeners[priority].forEach(function (listener) {
        // Creates new arguments array to call the listener with
        let groupedArgs = args.slice();
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

    // Sort the listeners by priority
    let priorities = Object.keys(listeners);
    priorities.sort();

    priorities.forEach(function (priority) {
      // Call all listeners
      listeners[priority].forEach(function (listener) {
        listener.apply(null, args);
      });
    });
  }
});
