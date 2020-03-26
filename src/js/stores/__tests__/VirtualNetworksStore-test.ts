import AppDispatcher from "../../events/AppDispatcher";
import VirtualNetworksStore from "../VirtualNetworksStore";
import * as EventTypes from "../../constants/EventTypes";
import * as ActionTypes from "../../constants/ActionTypes";

const apiData = () => [
  { name: "foo", prefix: 0, subnet: "bar" },
  { name: "bar", prefix: 1, subnet: "baz" },
];

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
  });

  describe("#getOverlays", () => {
    it("returns the overlays", () => {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS,
        data: apiData(),
      });

      const overlay = VirtualNetworksStore.getOverlays()[0];
      expect(overlay).toMatchObject({ name: "foo", subnet: "bar" });
    });
  });

  describe("dispatcher", () => {
    describe("fetch", () => {
      it("stores overlays when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS,
          data: apiData(),
        });

        expect(VirtualNetworksStore.getOverlays()[0].name).toEqual("foo");
        expect(VirtualNetworksStore.getOverlays()[1].name).toEqual("bar");
      });

      it("emits event after success event is dispatched", () => {
        const mockFn = jasmine.createSpy("listener");
        VirtualNetworksStore.addChangeListener(
          EventTypes.VIRTUAL_NETWORKS_CHANGE,
          mockFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS,
          data: apiData(),
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
          type: ActionTypes.REQUEST_VIRTUAL_NETWORKS_ERROR,
        });

        expect(mockFn.calls.count()).toBe(1);
      });
    });
  });
});
