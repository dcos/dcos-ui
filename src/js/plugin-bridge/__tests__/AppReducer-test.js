import { APPLICATION } from "#SRC/js/constants/PluginConstants";

import * as EventTypes from "../../constants/EventTypes";

const isEqual = require("deep-equal");
const PluginSDK = require("PluginSDK").default;
const PluginTestUtils = require("PluginTestUtils");

// Get State specific to Application
function getApplicationState() {
  return PluginSDK.Store.getState()[APPLICATION];
}

describe("AppReducer", () => {
  var expectedState = {
    foo: "bar",
    qux: { foo: "bar" }
  };

  it("alters state correctly when no plugins loaded", () => {
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

  it("alters state correctly after plugins loaded", () => {
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
    var mockPlugin = jest.genMockFunction().mockImplementation(() => () => ({
      foo: "bar"
    }));

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

  it("alters state correctly for storeID", () => {
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

  it("does not alter state if action dispatched from plugin", () => {
    var pluginDispatch;
    // Mock a fake plugin
    var mockPlugin = jest.genMockFunction().mockImplementation(SDK => {
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

  it("clones state", () => {
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
