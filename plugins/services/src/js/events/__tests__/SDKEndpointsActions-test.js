const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const Config = require("#SRC/js/config/Config");
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const SDKEndpointsActions = require("../SDKEndpointActions");

describe("SDKEndpointsActions", function() {
  describe("#fetchEndpoints", function() {
    const serviceId = "foo";

    context("#dispatcher", function() {
      it("dispatches the loading action first", function() {
        SDKEndpointsActions.fetchEndpoints(serviceId);

        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_SDK_ENDPOINTS_LOADING
          );
        });
      });
    });

    context("#RequestUtil", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        SDKEndpointsActions.fetchEndpoints(serviceId);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/${serviceId}/v1/endpoints`
        );
      });

      it("uses GET for the request method", function() {
        expect(this.configuration.method).toEqual("GET");
      });

      it("dispatches the correct action when successful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_SDK_ENDPOINTS_SUCCESS
          );
        });

        this.configuration.success({
          serviceId
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(ActionTypes.REQUEST_SDK_ENDPOINTS_ERROR);
        });

        this.configuration.error({ message: "error" });
      });

      it("dispatches the xhr when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.xhr).toEqual({
            responseJSON: { description: "foo" }
          });
        });

        this.configuration.error({
          responseJSON: { description: "foo" }
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

    it("call open with GET request method and correct url", function() {
      const url = `/service/${serviceId}/v1/endpoints/${endpointName}`;

      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      expect(mockXhr.open).toHaveBeenCalledWith("GET", url);
    });

    it("dispatches the correct action when successful", function() {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_SDK_ENDPOINT_SUCCESS);
      });

      mockXhr.onreadystatechange();
    });

    it("dispatches the correct action when unsuccessful", function() {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);
      mockXhr.status = 500;

      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_SDK_ENDPOINT_ERROR);
      });

      mockXhr.onreadystatechange();
    });
  });
});
