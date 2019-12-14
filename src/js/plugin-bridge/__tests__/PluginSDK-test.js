const isEqual = require("deep-equal");

const PluginSDK = require("PluginSDK").default;
const PluginTestUtils = require("PluginTestUtils");

const Hooks = PluginSDK.Hooks;

let thisMockPlugin, thisTestArgs, thisMockReducer;

describe("PluginSDK", () => {
  describe("#initialize", () => {
    describe("#reducers", () => {
      it("does not create a namespace in Store for plugin if no reducer returned", () => {
        // Mock a fake plugin
        thisMockPlugin = jest.genMockFunction().mockImplementation(() => {
          // Don't return anything
        });
        PluginTestUtils.loadPlugins({
          fakePlugin1: {
            module: thisMockPlugin,
            config: {
              enabled: true,
              foo: "bar"
            }
          }
        });
        var state = PluginSDK.Store.getState();
        expect(state.fakePlugin1).toEqual(undefined);
      });

      it("creates a namespace in Store for plugin if reducer returned", () => {
        // Mock a fake plugin
        thisMockPlugin = jest.genMockFunction().mockImplementation(() =>
          // Return reducer
          () =>
            // Return an initial state
            ({
              foo: "bar"
            })
        );
        PluginTestUtils.loadPlugins({
          fakePlugin2: {
            module: thisMockPlugin,
            config: {
              enabled: true,
              foo: "bar"
            }
          }
        });
        var state = PluginSDK.Store.getState();
        expect(isEqual(state.fakePlugin2, { foo: "bar" })).toEqual(true);
      });

      it("throws an error if reducer is not a function", () => {
        // Mock a fake plugin
        var mockPlugin = jest.genMockFunction().mockImplementation(() =>
          // Return invalid reducer
          ({})
        );
        expect(() => {
          PluginTestUtils.loadPlugins({
            badFakePlugin: {
              module: mockPlugin,
              config: {
                enabled: true,
                foo: "bar"
              }
            }
          });
        }).toThrow(new Error("Reducer for badFakePlugin must be a function"));
      });
    });
  });

  describe("#bootstrapPlugin", () => {
    beforeEach(() => {
      thisMockPlugin = jest.genMockFunction();

      PluginTestUtils.loadPlugins({
        fakePlugin3: {
          module: thisMockPlugin,
          config: {
            enabled: true,
            foo: "bar"
          }
        }
      });
    });

    it("calls plugin", () => {
      expect(thisMockPlugin.mock.calls.length).toBe(1);
    });

    it("calls plugin with correct # of args", () => {
      var args = thisMockPlugin.mock.calls[0];
      expect(args.length).toBe(1);
    });

    it("calls plugin with PluginSDK", () => {
      var SDK = thisMockPlugin.mock.calls[0][0];
      expect(SDK.toString()).toEqual(PluginSDK.toString());
    });

    it("contains Store in PluginSDK", () => {
      var store = thisMockPlugin.mock.calls[0][0].Store;
      expect(typeof store.subscribe).toEqual("function");
      expect(typeof store.getState).toEqual("function");
    });

    it("contains personal dispatch in PluginSDK", () => {
      var SDK = thisMockPlugin.mock.calls[0][0];
      var store = PluginSDK.Store;
      var dispatch = SDK.dispatch;
      var pluginID = SDK.pluginID;
      var storeDispatch = store.dispatch;
      store.dispatch = jest.genMockFunction();
      dispatch({
        type: "foo",
        data: "bar"
      });
      var dispatchedObject = {
        type: "foo",
        data: "bar",
        __origin: pluginID
      };
      expect(store.dispatch.mock.calls.length).toEqual(1);
      expect(
        isEqual(store.dispatch.mock.calls[0][0], dispatchedObject)
      ).toEqual(true);
      // Undo
      store.dispatch = storeDispatch;
    });

    it("contains pluginID in PluginSDK", () => {
      var pluginID = thisMockPlugin.mock.calls[0][0].pluginID;
      expect(pluginID).toEqual("fakePlugin3");
    });

    it("contains Hooks in PluginSDK", () => {
      var pluginHooks = thisMockPlugin.mock.calls[0][0].Hooks;
      expect(pluginHooks).toEqual(Hooks);
    });
  });

  describe("#store and dispatch", () => {
    beforeEach(() => {
      var mockReducer = jest.genMockFunction();
      // Mock reducer
      mockReducer.mockImplementation((state, action) => {
        if (!state || action.type === "reset") {
          return { foo: 1 };
        }
        switch (action.type) {
          case "foo":
            return { foo: state.foo + 1 };
          case "bar":
            return Object.assign({}, state, { bar: "qux" });
          default:
            return state;
        }
      });

      var testArgs = {};

      // Mock a fake plugin
      thisMockPlugin = jest.genMockFunction().mockImplementation(SDK => {
        testArgs.dispatch = SDK.dispatch;

        return mockReducer;
      });
      thisTestArgs = testArgs;
      thisMockReducer = mockReducer;

      PluginTestUtils.loadPlugins({
        anotherFakePlugin: {
          module: thisMockPlugin,
          config: {
            enabled: true,
            foo: "bar"
          }
        }
      });
    });

    it("calls reducer to get initial state", () => {
      // Redux calls the reducer 3 times to check everything
      expect(thisMockReducer.mock.calls.length).toEqual(3);
    });

    it("calls reducer with correct state", () => {
      thisTestArgs.dispatch({ type: "foo" });
      var prevState = thisMockReducer.mock.calls[3][0];
      expect(isEqual(prevState, { foo: 1 })).toEqual(true);
    });

    it("calls reducer with correct action", () => {
      thisTestArgs.dispatch({ type: "foo" });
      var action = thisMockReducer.mock.calls[3][1];
      expect(
        isEqual(action, { type: "foo", __origin: "anotherFakePlugin" })
      ).toEqual(true);
    });

    it("updates Store with new state #1", () => {
      thisTestArgs.dispatch({ type: "reset" });
      var state = PluginSDK.Store.getState().anotherFakePlugin;
      expect(isEqual(state, { foo: 1 })).toEqual(true);
    });

    it("updates Store with new state #2", () => {
      thisTestArgs.dispatch({ type: "foo" });
      var state = PluginSDK.Store.getState().anotherFakePlugin;
      expect(isEqual(state, { foo: 2 })).toEqual(true);
    });

    it("updates Store with new state #3", () => {
      thisTestArgs.dispatch({ type: "bar" });
      var state = PluginSDK.Store.getState().anotherFakePlugin;
      expect(isEqual(state, { foo: 2, bar: "qux" })).toEqual(true);
    });
  });
});
