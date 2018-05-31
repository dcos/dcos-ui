import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { StoreMixin } from "mesosphere-shared-reactjs";

import { APPLICATION, PLUGIN_LOAD_TIMEOUT } from "../constants/PluginConstants";
import { APP_STORE_CHANGE } from "../constants/EventTypes";
import ActionsPubSub from "./middleware/ActionsPubSub";
import AppReducer from "./AppReducer";
import AppHooks from "./AppHooks";
import Config from "../config/Config";
import Hooks from "./Hooks";
import PluginSDKStruct from "./PluginSDKStruct";
import Loader from "./Loader";

const hooks = new Hooks();
const initialState = {};
const middleware = [ActionsPubSub.pub];
const PLUGIN_ENV_CACHE = [];
const REGISTERED_ACTIONS = {};
const existingFluxStores = {};

const constants = {
  APPLICATION,
  APP_STORE_CHANGE
};

const reducers = {
  [APPLICATION]: AppReducer
};

// Default pass through function when devTools are not enabled
let devToolIfEnabled = function(f) {
  return f;
};

// Inject middleware to observe actions and state
if (
  Config.environment === "development" &&
  Config.uiConfigurationFixture.uiConfiguration.enableDevTools &&
  global.devToolsExtension
) {
  // Use Chrome extension if available
  // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
  devToolIfEnabled = global.devToolsExtension();
}

// Create Redux Store
const Store = createStore(
  combineReducers(reducers),
  initialState,
  compose(
    applyMiddleware(...middleware),
    devToolIfEnabled
  )
);

/**
 * Bootstraps plugins and adds new reducers to Store.
 *
 * @param {Object} pluginsConfig - Plugin configuration
 */
const initialize = function(pluginsConfig) {
  const { pluginsList, externalPluginsList } = Loader.getAvailablePlugins();

  Object.keys(pluginsConfig).forEach(function(pluginID) {
    // Make sure plugin is bundled
    if (!(pluginID in pluginsList) && !(pluginID in externalPluginsList)) {
      if (Config.environment === "development") {
        console.warn(`Plugin ${pluginID} not available in bundle`);
      }

      return;
    }

    let path;
    // Default to always selecting internal plugin if same pluginID
    // exists in external plugins. This makes mocking easier.
    if (pluginID in pluginsList) {
      path = pluginsList[pluginID];
    } else {
      path = externalPluginsList[pluginID];
    }
    // Bootstrap if plugin enabled
    if (pluginsConfig[pluginID] && pluginsConfig[pluginID].enabled) {
      bootstrapPlugin(pluginID, path, pluginsConfig[pluginID]);
    }
  });

  replaceStoreReducers();

  // Allows plugins to do things before the application ever renders
  const promises = hooks.applyFilter("pluginsLoadedCheck", []);
  let pluginsLoaded = false;

  Promise.all(promises).then(function() {
    pluginsLoaded = true;
    hooks.doAction("pluginsConfigured");
  });

  global.setTimeout(() => {
    if (!pluginsLoaded) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to load plugins.");
      }
    }
  }, PLUGIN_LOAD_TIMEOUT);
};

/**
 * Creates a personalized dispatch for each plugin
 * @param  {String} pluginID Plugin pluginID
 * @return {Function}    Dispatch method
 */
const createDispatcher = function(pluginID) {
  return function(action) {
    // Inject origin namespace if simple Object
    if (action === Object(action)) {
      action = Object.assign({}, action, { __origin: pluginID });
    }
    Store.dispatch(action);
  };
};

/**
 * Builds Actions API for registerActions and getActions.
 * Get Actions automatically instantiates actions module with
 * the requesting Plugin's SDK so dispatch is bound to the requesting Plugin.
 * @param  {PluginSDK} SDK - PluginSDK
 * @return {Object}     - API for registering/requesting actions
 */
const getActionsAPI = function(SDK) {
  return {
    registerActions(actions, name) {
      if (SDK.pluginID in REGISTERED_ACTIONS) {
        throw new Error(`${SDK.pluginID} already has registered actions.`);
      }
      // Allow Application to name it's actions. Plugins have actions
      // registered under their pluginID
      if (SDK.pluginID !== APPLICATION) {
        name = SDK.pluginID;
      }
      REGISTERED_ACTIONS[name] = actions;
    },

    getActions(name, defaultValue) {
      if (!name || typeof name !== "string") {
        throw new Error(`Name not valid. Passed in ${name}`);
      }
      // Return Actions instantiated with SDK.
      // Actions will now use Plugin's own dispatch
      if (!REGISTERED_ACTIONS[name]) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw Error(
          `No registered actions for ${name}. Make sure plugin is loaded or actions are registered`
        );
      }

      return REGISTERED_ACTIONS[name];
    }
  };
};

/**
 * Create a flux store that exposes events to components. This store
 * does not support set methods. It provides an abstraction for handling
 * state changes in the OmniStore.
 * @param  {Object} definition - Store definition
 * @return {Object}            - Created store
 */
const addStoreConfig = function(definition) {
  if (definition) {
    if (!definition.storeID) {
      throw new Error("Must define a valid storeID to expose events");
    }
    if (definition.storeID in existingFluxStores) {
      throw new Error(`Store with ID ${definition.storeID} already exists.`);
    }
    existingFluxStores[definition.storeID] = definition;
    // Register events with StoreMixin. Only import this as needed
    // because its presence will degrade test performance.
    StoreMixin.store_configure(existingFluxStores);
  }

  return definition;
};

/**
 * Return a slice of the State
 * @param  {String} root - root of the slice to return
 * @return {Function}      Returns state at root
 */
const getStateRootedAt = function(root) {
  return function() {
    return Store.getState()[root];
  };
};

/**
 * Extends the PluginSDK
 * @param  {PluginSDK} SDK - SDK to extend
 * @param  {Object} obj  - Key value pairs to be added to SDK
 */
const extendSDK = function(SDK, obj) {
  Object.keys(obj).forEach(function(methodName) {
    SDK[methodName] = obj[methodName].bind(SDK);
  });
};

/**
 * Builds SDK for pluginID
 * @param  {String} pluginID - ID for plugin
 * @param  {Object} config   - Config
 * @return {PluginSDK}       - SDK for plugins
 */
const getSDK = function(pluginID, config) {
  if (pluginID in PLUGIN_ENV_CACHE) {
    return PLUGIN_ENV_CACHE[pluginID];
  }

  let StoreAPI = Store;

  if (pluginID !== APPLICATION) {
    // Limit access for Plugins
    StoreAPI = {
      subscribe: Store.subscribe.bind(Store),
      getState: Store.getState.bind(Store),
      getOwnState: getStateRootedAt(pluginID),
      getAppState: getStateRootedAt(APPLICATION)
    };
  }

  const SDK = new PluginSDKStruct({
    addStoreConfig,
    constants,
    onDispatch,
    pluginID,
    config: config || {},
    dispatch: createDispatcher(pluginID),
    Hooks: hooks,
    Store: StoreAPI
  });

  extendSDK(SDK, getActionsAPI(SDK));

  PLUGIN_ENV_CACHE[pluginID] = SDK;

  return SDK;
};

/**
 * Bootstraps a plugin
 *
 * @param  {String} pluginID   Plugin's pluginID from config
 * @param  {Module} plugin Plugin module or path to entry point within plugins directory
 * @param  {Object} config Plugin configuration
 */
const bootstrapPlugin = function(pluginID, plugin, config) {
  // Inject Application key constant and configOptions if specified
  const SDK = getSDK(pluginID, config);

  const pluginReducer = plugin(SDK);

  // If plugin exported a reducer, add it to the reducers object
  if (pluginReducer) {
    addPluginReducer(pluginReducer, pluginID);
  }
};

/**
 * Adds a plugin's reducer to the reducers Object
 *
 * @param {Function} reducer    Reducer function to manage plugins state in Store
 * @param {String} pluginID     Plugin's ID
 */
const addPluginReducer = function(reducer, pluginID) {
  if (typeof reducer !== "function") {
    throw new Error(`Reducer for ${pluginID} must be a function`);
  }
  reducers[pluginID] = reducer;
};

/**
 * Replace reducers in Store
 */
const replaceStoreReducers = function() {
  // Replace all store reducers now that we have all plugin reducers
  Store.replaceReducer(combineReducers(reducers));
};

/**
 * Add reducer to Store (only available in test mode so we can test plugins
 * that rely on State)
 * @param {String} pluginID - Plugin ID
 * @param  {Function} reducer - A reducer
 */
const __addReducer = function(pluginID, reducer) {
  addPluginReducer(reducer, pluginID);
  replaceStoreReducers();
};

/**
 * Register a callback to be invoked for every dispatched action
 * @param  {Function} callback - Function invoked with action as argument for all dispatched Actions.
 * @returns {Function} - unsubscribe
 */
const onDispatch = function(callback) {
  // Add ability to react to actions outside of a reducer.
  // This will most likely be deprecated at some point but for now it gives
  // us backwards compatibility with much of our existing dispatcher code
  return ActionsPubSub.sub(callback);
};

// Subscribe to Store config change and call initialize with
// new plugin configuration
const unSubscribe = Store.subscribe(function() {
  const configStore = Store.getState()[APPLICATION].config;
  if (configStore && configStore.config && configStore.config.uiConfiguration) {
    // unsubscribe once we have the config
    unSubscribe();
    initialize(configStore.config.uiConfiguration.plugins);
  }
});

// Lets get an SDK for the Application
const ApplicationSDK = getSDK(APPLICATION, Config);
// Register our Actions
AppHooks.initialize(ApplicationSDK);

// Add helper for PluginTestUtils. This allows us to get SDKS for other plugins
if (global.__DEV__) {
  ApplicationSDK.__getSDK = getSDK;
  ApplicationSDK.__addReducer = __addReducer;
}

// Add manual load method
ApplicationSDK.initialize = initialize;

module.exports = ApplicationSDK;
