const APPLICATION = require("../../constants/PluginConstants").APPLICATION;
const PluginSDK = require("PluginSDK");

let thisMockFn, thisMockFn1, thisUnsubscribe;

describe("#ActionsPubSub", function() {
  beforeEach(function() {
    thisMockFn = jest.genMockFunction();
    thisMockFn1 = jest.genMockFunction();
    thisUnsubscribe = PluginSDK.onDispatch(thisMockFn);
    PluginSDK.onDispatch(thisMockFn1);
  });

  it("receives actions after subscribing", function() {
    PluginSDK.dispatch({ type: "foo" });
    expect(thisMockFn.mock.calls.length).toEqual(1);
    expect(thisMockFn1.mock.calls.length).toEqual(1);
    expect(thisMockFn.mock.calls[0][0]).toEqual({
      type: "foo",
      __origin: APPLICATION
    });
  });

  it("stops receiving actions after unsubscribing", function() {
    thisUnsubscribe();
    PluginSDK.dispatch({ type: "foo" });
    expect(thisMockFn.mock.calls.length).toEqual(0);
    expect(thisMockFn1.mock.calls.length).toEqual(1);
  });
});
