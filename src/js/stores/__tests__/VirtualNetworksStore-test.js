import AppDispatcher from "../../events/AppDispatcher";
import OverlayList from "../../structs/OverlayList";
import VirtualNetworksStore from "../VirtualNetworksStore";

const ActionTypes = require("../../constants/ActionTypes");
const EventTypes = require("../../constants/EventTypes");

describe("VirtualNetworksStore", () => {
  beforeEach(() => {
    const changeHandler = jasmine.createSpy("changeHandler");
    VirtualNetworksStore.addChangeListener(
      EventTypes.VIRTUAL_NETWORKS_CHANGE,
      changeHandler
    );
  });

  afterEach(() => {
    VirtualNetworksStore.removeAllListeners();
    VirtualNetworksStore.stopPolling();
  });

  describe("#getOverlays", () => {
    it("returns the overlays", () => {
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
        VirtualNetworksStore.getOverlays()
          .getItems()[0]
          .getName()
      ).toEqual("foo");

      expect(
        VirtualNetworksStore.getOverlays()
          .getItems()[0]
          .getSubnet()
      ).toEqual("bar");
    });
  });

  describe("dispatcher", () => {
    describe("fetch", () => {
      it("stores overlays when event is dispatched", () => {
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
          VirtualNetworksStore.getOverlays()
            .getItems()[0]
            .getName()
        ).toEqual("foo");

        expect(
          VirtualNetworksStore.getOverlays()
            .getItems()[1]
            .getName()
        ).toEqual("bar");
      });

      it("emits event after success event is dispatched", () => {
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

      it("emits event after error event is dispatched", () => {
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
