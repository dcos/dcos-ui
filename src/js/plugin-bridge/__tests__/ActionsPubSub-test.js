jest.dontMock("../middleware/ActionsPubSub");

const APPLICATION = require("../../constants/PluginConstants").APPLICATION;
const PluginSDK = require("PluginSDK");

describe("#ActionsPubSub", function() {
  beforeEach(function() {
    this.mockFn = jest.genMockFunction();
    this.mockFn1 = jest.genMockFunction();
    this.unsubscribe = PluginSDK.onDispatch(this.mockFn);
    this.unsubscribe1 = PluginSDK.onDispatch(this.mockFn1);
  });

  it("should receive actions after subscribing", function() {
    PluginSDK.dispatch({ type: "foo" });
    expect(this.mockFn.mock.calls.length).toEqual(1);
    expect(this.mockFn1.mock.calls.length).toEqual(1);
    expect(this.mockFn.mock.calls[0][0]).toEqual({
      type: "foo",
      __origin: APPLICATION
    });
  });

  it("should stop receiving actions after unsubscribing", function() {
    this.unsubscribe();
    PluginSDK.dispatch({ type: "foo" });
    expect(this.mockFn.mock.calls.length).toEqual(0);
    expect(this.mockFn1.mock.calls.length).toEqual(1);
  });
});
