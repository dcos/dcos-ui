import PluginTestUtils from "PluginTestUtils";

import { APPLICATION } from "#SRC/js/constants/PluginConstants";

import * as EventTypes from "../../constants/EventTypes";

import isEqual from "deep-equal";
import PluginSDK from "PluginSDK";

// Get State specific to Application
function getApplicationState() {
  return PluginSDK.Store.getState()[APPLICATION];
}

describe("AppReducer", () => {
  const expectedState = {
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

    const state = getApplicationState();

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
    const mockPlugin = jest.fn(() => () => ({
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

    const state = getApplicationState();
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

    const state = getApplicationState();
    // lets remove the config stuff just for ease
    delete state.config;
    expect(isEqual(state, expectedState)).toEqual(true);
  });

  it("does not alter state if action dispatched from plugin", () => {
    let pluginDispatch;
    // Mock a fake plugin
    const mockPlugin = jest.fn(SDK => {
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
    const state = getApplicationState();
    // lets remove the config stuff just for ease
    delete state.config;
    expect(isEqual(state, expectedState)).toEqual(true);
  });

  it("clones state", () => {
    const nestedObj = {};
    const data = {
      foo: "bar",
      nested: nestedObj
    };
    PluginSDK.dispatch({
      type: EventTypes.APP_STORE_CHANGE,
      storeID: "foo",
      data
    });
    const state = getApplicationState();

    expect(state.foo !== data).toEqual(true);
    expect(state.foo.nestedObj !== nestedObj).toEqual(true);
  });
});
