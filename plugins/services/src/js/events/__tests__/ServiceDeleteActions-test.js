const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const CosmosActionTypes = require("#SRC/js/constants/ActionTypes");
const ActionTypes = require("../../constants/ActionTypes");
const ServiceDeleteActions = require("../ServiceDeleteActions");
const Framework = require("../../structs/Framework");

describe("ServiceDeleteActions", function() {
  describe("#deleteGroup", function() {
    const groupDefinition = {
      id: "/test",
      getId() {
        return "/test";
      }
    };

    context("#RequestUtil", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        ServiceDeleteActions.deleteGroup(groupDefinition, false);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });
      it("dispatches the correct action when successful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_GROUP_DELETE_SUCCESS
          });
        });

        this.configuration.success();
      });

      it("dispatches the correct action when unsuccessful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_GROUP_DELETE_ERROR,
            xhr: { error: {} },
            data: {}
          });
        });

        this.configuration.error({ error: {} });
      });
    });
  });

  describe("#deleteService", function() {
    const serviceDefinition = {
      id: "/test",
      getId() {
        return "/test";
      }
    };

    context("#RequestUtil", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        ServiceDeleteActions.deleteService(serviceDefinition);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });
      it("dispatches the correct action when successful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
          });
        });

        this.configuration.success();
      });

      it("dispatches the correct action when unsuccessful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR,
            xhr: { error: {} },
            data: {}
          });
        });

        this.configuration.error({ error: {} });
      });
    });

    describe("#deleteFramework", function() {
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

      context("#RequestUtil", function() {
        beforeEach(function() {
          spyOn(RequestUtil, "json");
          ServiceDeleteActions.deleteService(frameworkDefinition);
          this.configuration = RequestUtil.json.calls.mostRecent().args[0];
        });

        it("dispatches the correct action when successful framework deleted", function() {
          const id = AppDispatcher.register(function(payload) {
            const action = payload.action;
            AppDispatcher.unregister(id);
            expect(action).toEqual({
              appId: "/test",
              type: CosmosActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
              data: {},
              packageName: "package1"
            });
          });

          this.configuration.success({});
        });

        it("dispatches the correct action when unsuccessful framework deleted", function() {
          const id = AppDispatcher.register(function(payload) {
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

          this.configuration.error({ error: {} });
        });
      });
    });
  });
});
