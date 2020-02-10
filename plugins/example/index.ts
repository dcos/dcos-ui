import PluginHooks from "./hooks";
// Declare some constants for my plugin's event types.
const EXAMPLE_PLUGIN_EVENT = "EXAMPLE_PLUGIN_EVENT";

const initialPluginState = {
  countSoFar: 0
};

const performComplexMath = (Store, prevState, action, factor) => {
  const newState = {};
  // Can access entire state tree (e.g. services etc)
  // let globalState = Store.getState();
  //
  // Lets just do some addition and multiply by our options parameter
  newState.countSoFar = prevState.countSoFar + action.payload * factor;

  // Don't mutate state - return new state
  return { ...prevState, ...newState };
};

export default PluginSDK => {
  const { Hooks, config, Store, dispatch } = PluginSDK;

  // Set plugin's hooks
  PluginHooks.initialize(Hooks);

  if (config.enabled) {
    setInterval(() => {
      dispatch({
        type: EXAMPLE_PLUGIN_EVENT,
        payload: 1
      });
    }, 5000);
  }

  function RootReducer(state = initialPluginState, action) {
    switch (action.type) {
      case EXAMPLE_PLUGIN_EVENT:
        return performComplexMath(Store, ...arguments, config.multiplier);
      default:
        return state;
    }
  }

  return RootReducer;
};
