const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;
const Config = require("#SRC/js/config/Config");
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const SDKEndpointsActions = require("../SDKEndpointActions");

let thisConfiguration;

describe("SDKEndpointsActions", function() {
  describe("#fetchEndpoints", function() {
    const serviceId = "foo";

    context("#RequestUtil", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        SDKEndpointsActions.fetchEndpoints(serviceId);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/${serviceId}/v1/endpoints`
        );
      });

      it("uses GET for the request method", function() {
        expect(thisConfiguration.method).toEqual("GET");
      });

      it("dispatches the correct action when successful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            type: ActionTypes.REQUEST_SDK_ENDPOINTS_SUCCESS,
            data: {
              serviceId: "foo",
              endpoints: ["endpoint1", "endpoint2"]
            }
          });
        });

        thisConfiguration.success(["endpoint1", "endpoint2"]);
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            data: { error: {}, serviceId: "foo" },
            type: "REQUEST_SDK_ENDPOINTS_ERROR",
            xhr: { error: {}, serviceId: "foo" }
          });
        });

        thisConfiguration.error({ error: {}, serviceId: "foo" });
      });

      it("dispatches the xhr when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.xhr).toEqual({
            error: { description: "foo" }
          });
        });

        thisConfiguration.error({
          error: { description: "foo" }
        });
      });
    });
  });

  describe("#fetchEndpoint", function() {
    let mockXhr;
    const originalXhr = global.XMLHttpRequest;
    const serviceId = "foo";
    const endpointName = "arangodb";

    beforeEach(function() {
      mockXhr = {
        open: jest.fn(),
        send: jest.fn(),
        readyState: 4,
        status: 200,
        getResponseHeader: () => "application/json",
        response: JSON.stringify({
          data: "some data"
        })
      };

      global.XMLHttpRequest = jest.fn(() => mockXhr);
    });

    afterEach(function() {
      global.XMLHttpRequest = originalXhr;
    });

    it("XMLHttpRequest open was called", function() {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      expect(mockXhr.open).toHaveBeenCalled();
    });

    it("calls open with GET request method and correct url", function() {
      const url = `/service/${serviceId}/v1/endpoints/${endpointName}`;

      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      expect(mockXhr.open).toHaveBeenCalledWith("GET", url);
    });

    it("dispatches the correct action when successful JSON returned", function() {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action).toEqual({
          type: ActionTypes.REQUEST_SDK_ENDPOINT_SUCCESS,
          data: {
            contentType: "application/json",
            endpointData: { data: "some data" },
            endpointName: "arangodb",
            serviceId: "foo"
          }
        });
      });

      mockXhr.onload();
    });

    it("dispatches the correct action when successful text returned", function() {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action).toEqual({
          type: ActionTypes.REQUEST_SDK_ENDPOINT_SUCCESS,
          data: {
            contentType: "text/plain",
            endpointData: "endpoint raw string",
            endpointName: "arangodb",
            serviceId: "foo"
          }
        });
      });

      mockXhr.getResponseHeader = () => "text/plain";
      mockXhr.response = "endpoint raw string";
      mockXhr.onload();
    });

    it("dispatches the correct action when unsuccessful", function() {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);
      mockXhr.status = 500;

      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action).toEqual({
          type: ActionTypes.REQUEST_SDK_ENDPOINT_ERROR,
          data: {
            error: '{"data":"some data"}',
            serviceId: "foo"
          }
        });
      });

      mockXhr.onerror();
    });
  });
});
