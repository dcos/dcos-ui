import { APPLICATION } from "#SRC/js/constants/PluginConstants";

const isEqual = require("deep-equal");

const EventTypes = require("../../constants/EventTypes");
const PluginSDK = require("PluginSDK");

// Get State specific to Application
function getApplicationState() {
  return PluginSDK.Store.getState()[APPLICATION];
}

describe("AppReducer", () => {
  var expectedState = {
    foo: "bar",
    qux: { foo: "bar" }
  };

  it("alters state correctly", () => {
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
