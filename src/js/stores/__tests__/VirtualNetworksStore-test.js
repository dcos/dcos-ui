jest.dontMock("../VirtualNetworksStore");
jest.dontMock("../../events/AppDispatcher");
jest.dontMock("../../events/VirtualNetworksActions");

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const EventTypes = require("../../constants/EventTypes");
const OverlayList = require("../../structs/OverlayList");
const VirtualNetworksStore = require("../VirtualNetworksStore");

describe("VirtualNetworksStore", function() {
  beforeEach(function() {
    const changeHandler = jasmine.createSpy("changeHandler");
    VirtualNetworksStore.addChangeListener(
      EventTypes.VIRTUAL_NETWORKS_CHANGE,
      changeHandler
    );
  });

  afterEach(function() {
    VirtualNetworksStore.removeAllListeners();
    VirtualNetworksStore.stopPolling();
  });

  describe("#getOverlays", function() {
    it("returns the overlays", function() {
      const data = {
        overlays: [
          { info: { name: "foo", prefix: 0, subnet: "bar" } },
          { info: { name: "bar", prefix: 1, subnet: "baz" } }
        ]
      };
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS,
        data
      });

      expect(VirtualNetworksStore.getOverlays() instanceof OverlayList).toBe(
        true
      );

      expect(
        VirtualNetworksStore.getOverlays().getItems()[0].getName()
      ).toEqual("foo");

      expect(
        VirtualNetworksStore.getOverlays().getItems()[0].getSubnet()
      ).toEqual("bar");
    });
  });

  describe("dispatcher", function() {
    describe("fetch", function() {
      it("stores overlays when event is dispatched", function() {
        const data = {
          overlays: [
            { info: { name: "foo", prefix: 0, subnet: "bar" } },
            { info: { name: "bar", prefix: 1, subnet: "baz" } }
          ]
        };
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS,
          data
        });

        expect(
          VirtualNetworksStore.getOverlays().getItems()[0].getName()
        ).toEqual("foo");

        expect(
          VirtualNetworksStore.getOverlays().getItems()[1].getName()
        ).toEqual("bar");
      });

      it("emits event after success event is dispatched", function() {
        const mockFn = jasmine.createSpy("listener");
        VirtualNetworksStore.addChangeListener(
          EventTypes.VIRTUAL_NETWORKS_CHANGE,
          mockFn
        );
        const data = {
          overlays: [
            { info: { name: "foo", prefix: 0, subnet: "bar" } },
            { info: { name: "bar", prefix: 1, subnet: "baz" } }
          ]
        };
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS,
          data
        });

        expect(mockFn.calls.count()).toBe(1);
      });

      it("emits event after error event is dispatched", function() {
        const mockFn = jasmine.createSpy("listener");
        VirtualNetworksStore.addChangeListener(
          EventTypes.VIRTUAL_NETWORKS_REQUEST_ERROR,
          mockFn
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_ERROR
        });

        expect(mockFn.calls.count()).toBe(1);
      });
    });
  });
});
