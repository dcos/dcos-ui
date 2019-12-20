import { APPLICATION } from "#SRC/js/constants/PluginConstants";

const PluginSDK = require("PluginSDK").default;

let thisMockFn, thisMockFn1, thisUnsubscribe;

describe("#ActionsPubSub", () => {
  beforeEach(() => {
    thisMockFn = jest.genMockFunction();
    thisMockFn1 = jest.genMockFunction();
    thisUnsubscribe = PluginSDK.onDispatch(thisMockFn);
    PluginSDK.onDispatch(thisMockFn1);
  });

  it("receives actions after subscribing", () => {
    PluginSDK.dispatch({ type: "foo" });
    expect(thisMockFn.mock.calls.length).toEqual(1);
    expect(thisMockFn1.mock.calls.length).toEqual(1);
    expect(thisMockFn.mock.calls[0][0]).toEqual({
      type: "foo",
      __origin: APPLICATION
    });
  });

  it("stops receiving actions after unsubscribing", () => {
    thisUnsubscribe();
    PluginSDK.dispatch({ type: "foo" });
    expect(thisMockFn.mock.calls.length).toEqual(0);
    expect(thisMockFn1.mock.calls.length).toEqual(1);
  });
});
