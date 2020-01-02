import VirtualNetworksActions from "../VirtualNetworksActions";
import AppDispatcher from "../AppDispatcher";

import { RequestUtil } from "mesosphere-shared-reactjs";

import * as ActionTypes from "../../constants/ActionTypes";
import Config from "#SRC/js/config/Config";

const { virtualNetworksApi } = Config;

let thisConfiguration;

describe("VirtualNetworksActions", () => {
  describe("#fetch", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      VirtualNetworksActions.fetch();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS
        );
      });
      thisConfiguration.success({ agents: [], network: { overlays: [] } });
    });

    it("requests the right URL", () => {
      VirtualNetworksActions.fetch();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

      expect(thisConfiguration.url).toEqual(virtualNetworksApi + "/state");
    });

    it("dispatches the correct data when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ overlays: [] });
      });

      thisConfiguration.success({ agents: [], network: { overlays: [] } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_VIRTUAL_NETWORKS_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct data when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
