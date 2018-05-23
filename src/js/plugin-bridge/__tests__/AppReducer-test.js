const isEqual = require("deep-equal");

const EventTypes = require("../../constants/EventTypes");
const PluginSDK = require("PluginSDK");
const PluginConstants = require("../../constants/PluginConstants");
const PluginTestUtils = require("PluginTestUtils");

// Get State specific to Application
function getApplicationState() {
  return PluginSDK.Store.getState()[PluginConstants.APPLICATION];
}

describe("AppReducer", function() {
  var expectedState = {
    foo: "bar",
    qux: { foo: "bar" }
  };

  it("alters state correctly when no plugins loaded", function() {
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "foo",
      data: "bar"
    });
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "qux",
      data: { foo: "bar" }
    });
    PluginSDK.initialize({});

    var state = getApplicationState();

    expect(isEqual(state, expectedState)).toEqual(true);
  });

  it("alters state correctly after plugins loaded", function() {
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "foo",
      data: "bar"
    });
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "qux",
      data: { foo: "bar" }
    });
    // Mock a fake plugin
    var mockPlugin = jest.genMockFunction().mockImplementation(function() {
      return function() {
        return { foo: "bar" };
      };
    });

    PluginTestUtils.loadPlugins({
      fakePlugin: {
        module: mockPlugin,
        config: {
          enabled: true
        }
      }
    });

    var state = getApplicationState();
    // lets remove the config stuff just for ease
    delete state.config;
    expect(isEqual(state, expectedState)).toEqual(true);
  });

  it("alters state correctly for storeID", function() {
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "foo",
      data: "bar"
    });
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "qux",
      data: { foo: "bar" }
    });

    var state = getApplicationState();
    // lets remove the config stuff just for ease
    delete state.config;
    expect(isEqual(state, expectedState)).toEqual(true);
  });

  it("does not alter state if action dispatched from plugin", function() {
    var pluginDispatch;
    // Mock a fake plugin
    var mockPlugin = jest.genMockFunction().mockImplementation(function(SDK) {
      pluginDispatch = SDK.dispatch;
    });

    PluginTestUtils.loadPlugins({
      fakePluginAgain: {
        module: mockPlugin,
        config: {
          enabled: true
        }
      }
    });

    pluginDispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "foo",
      data: "boom"
    });
    var state = getApplicationState();
    // lets remove the config stuff just for ease
    delete state.config;
    expect(isEqual(state, expectedState)).toEqual(true);
  });

  it("clones state", function() {
    var nestedObj = {};
    var data = {
      foo: "bar",
      nested: nestedObj
    };
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "foo",
      data
    });
    var state = getApplicationState();

    expect(state.foo !== data).toEqual(true);
    expect(state.foo.nestedObj !== nestedObj).toEqual(true);
  });
});
