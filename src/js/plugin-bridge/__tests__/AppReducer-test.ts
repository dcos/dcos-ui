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
});
