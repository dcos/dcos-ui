import TransactionTypes from "../constants/TransactionTypes";

module.exports = {
  /**
   * This function is heavily inspired by the combineReducer function from
   * redux. https://github.com/reactjs/redux/blob/master/src/combineReducers.js
   *
   * It does await a structured object with a key: value combination where
   * the value is a function that awaits a state and an action. Which is the
   * same format as the usual reducer function does have. The function
   * returns a single reducer function which calls all the functions and
   * returns a object with the key values corresponding to the input.
   *
   * We removed all unnecessary checks which are used in the store use case.
   * And boiled it
   * down to only the bare minimum in code.
   *
   * We also added the feature that each reducer does have it's own context.
   * which gets reset if the passed index is 0.
   *
   * @param {Object} reducers An object whose values correspond to different
   * reducer functions that need to be combined into one.
   *
   * @returns {Function} A reducer function that invokes every reducer inside
   *   the passed object, and builds a state object with the same shape.
   */
  combineReducers(reducers = {}) {
    const reducerKeys = Object.keys(reducers).filter(function(reducerKey) {
      return typeof reducers[reducerKey] === "function";
    });
    // This is creating the context for this combined reducer.
    const context = new WeakMap();

    return function(state, action, index = 0) {
      let reducerIndex = reducerKeys.length;
      const localState = Object.assign({}, state);

      // As the while is faster then the Array.prototype.forEach and this
      // function can potentially be called more often we choose while here.
      while (--reducerIndex >= 0) {
        const key = reducerKeys[reducerIndex];

        const reducer = reducers[key];

        if (index === 0 || !context.has(reducer)) {
          context.set(reducer, {});
        }

        // This will call the reducer function with a context, and passes
        // the current state of the field plus the action against a reducer
        // function.
        // This will result in the same as
        // reducer.bind(context.get(reducer))(state[key], action);
        // but it will not copy the function, which in this case is a huge
        // increase in performance.
        localState[key] = reducer.call(
          context.get(reducer),
          localState[key],
          action,
          index
        );
      }

      return localState;
    };
  },

  /**
   * Parse only integer values and passes-through any other types
   *
   * @param {any} value - The source value
   * @returns {Number|any} - Returns a numerical value or the value itself
   */
  parseIntValue(value) {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }

    return value;
  },

  simpleReducer(needle, defaultState = "") {
    return function(state = defaultState, { path, type, value }) {
      if (type === TransactionTypes.SET && path.join(".") === needle) {
        return value;
      }

      return state;
    };
  },

  simpleIntReducer(needle, defaultState = "") {
    return function(state = defaultState, { path, type, value }) {
      const parsedValue = parseInt(value, 10);
      if (type === TransactionTypes.SET && path.join(".") === needle) {
        if (!isNaN(parsedValue)) {
          return parsedValue;
        }

        return value;
      }

      return state;
    };
  },

  simpleFloatReducer(needle, defaultState = "") {
    return function(state = defaultState, { path, type, value }) {
      const parsedValue = parseFloat(value);
      if (type === TransactionTypes.SET && path.join(".") === needle) {
        if (!isNaN(parsedValue)) {
          return parsedValue;
        }

        return value;
      }

      return state;
    };
  }
};
