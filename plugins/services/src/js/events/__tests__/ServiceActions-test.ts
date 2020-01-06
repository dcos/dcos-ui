import AppDispatcher from "#SRC/js/events/AppDispatcher";
import ServiceActions from "../ServiceActions";
import Framework from "../../structs/Framework";

import { RequestUtil } from "mesosphere-shared-reactjs";
import * as CosmosActionTypes from "#SRC/js/constants/ActionTypes";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration;

describe("ServiceActions", () => {
  describe("#deleteGroup", () => {
    const groupDefinition = {
      id: "/test",
      getId() {
        return "/test";
      }
    };

    describe("#RequestUtil", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        ServiceActions.deleteGroup(groupDefinition, false);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });
      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_GROUP_DELETE_SUCCESS
          });
        });

        thisConfiguration.success();
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_GROUP_DELETE_ERROR,
            xhr: { error: {} },
            data: {}
          });
        });

        thisConfiguration.error({ error: {} });
      });
    });
  });

  describe("#deleteService", () => {
    const serviceDefinition = {
      id: "/test",
      getId() {
        return "/test";
      }
    };

    describe("#RequestUtil", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        ServiceActions.deleteService(serviceDefinition);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });
      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
          });
        });

        thisConfiguration.success();
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR,
            xhr: { error: {} },
            data: {}
          });
        });

        thisConfiguration.error({ error: {} });
      });
    });

    describe("#deleteFramework", () => {
      const serviceDefinition = {
        id: "/test",
        getId() {
          return "/test";
        },
        getPackageName() {
          return "package1";
        }
      };
      const frameworkDefinition = new Framework(serviceDefinition);

      describe("#RequestUtil", () => {
        beforeEach(() => {
          spyOn(RequestUtil, "json");
          ServiceActions.deleteService(frameworkDefinition);
          thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
        });

        it("dispatches the correct action when successful framework deleted", () => {
          const id = AppDispatcher.register(payload => {
            const action = payload.action;
            AppDispatcher.unregister(id);
            expect(action).toEqual({
              appId: "/test",
              type: CosmosActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
              data: {},
              packageName: "package1"
            });
          });

          thisConfiguration.success({});
        });

        it("dispatches the correct action when unsuccessful framework deleted", () => {
          const id = AppDispatcher.register(payload => {
            const action = payload.action;
            AppDispatcher.unregister(id);
            expect(action).toEqual({
              appId: "/test",
              type: CosmosActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
              xhr: { error: {} },
              data: {},
              packageName: "package1"
            });
          });

          thisConfiguration.error({ error: {} });
        });
      });
    });
  });
});
