const APPLICATION = require("../../constants/PluginConstants").APPLICATION;
const PluginSDK = require("PluginSDK");

// eslint-disable-next-line no-unused-vars
let thisMockFn, thisMockFn1, thisUnsubscribe, thisUnsubscribe1;

describe("#ActionsPubSub", function() {
  beforeEach(function() {
    thisMockFn = jest.genMockFunction();
    thisMockFn1 = jest.genMockFunction();
    thisUnsubscribe = PluginSDK.onDispatch(thisMockFn);
    thisUnsubscribe1 = PluginSDK.onDispatch(thisMockFn1);
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
