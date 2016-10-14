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
    let reducerKeys = Object.keys(reducers).filter(
      function (reducer) {
        return typeof reducers[reducer] === 'function';
      }
    );

    // This is creating the context for this combined reducer.
    let context = new WeakMap();

    return function (state = {}, action, index = 0) {
      let i = reducerKeys.length;

      // As the while is faster then the Array.prototype.forEach and this
      // function can potentially be called more often we choose while here.
      while (--i >= 0) {
        let key = reducerKeys[i];

        let reducer = reducers[key];

        if (index === 0 || !context.has(reducer)) {
          context.set(reducer, {});
        }

        state[key] =
          reducer.call(context.get(reducer), state[key], action, state);
      }
      return state;
    };
  }
};
