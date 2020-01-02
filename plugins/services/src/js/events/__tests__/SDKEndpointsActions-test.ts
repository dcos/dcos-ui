import AppDispatcher from "#SRC/js/events/AppDispatcher";
import SDKEndpointsActions from "../SDKEndpointActions";

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;
const Config = require("#SRC/js/config/Config").default;
const ActionTypes = require("../../constants/ActionTypes");

let thisConfiguration;

describe("SDKEndpointsActions", () => {
  describe("#fetchEndpoints", () => {
    const serviceId = "foo";

    describe("#RequestUtil", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        SDKEndpointsActions.fetchEndpoints(serviceId);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/${serviceId}/v1/endpoints`
        );
      });

      it("uses GET for the request method", () => {
        expect(thisConfiguration.method).toEqual("GET");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
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

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action).toEqual({
            data: { error: {}, serviceId: "foo" },
            type: "REQUEST_SDK_ENDPOINTS_ERROR",
            xhr: { error: {}, serviceId: "foo" }
          });
        });

        thisConfiguration.error({ error: {}, serviceId: "foo" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

  describe("#fetchEndpoint", () => {
    let mockXhr;
    const originalXhr = window.XMLHttpRequest;
    const serviceId = "foo";
    const endpointName = "arangodb";

    beforeEach(() => {
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

      window.XMLHttpRequest = jest.fn(() => mockXhr);
    });

    afterEach(() => {
      window.XMLHttpRequest = originalXhr;
    });

    it("XMLHttpRequest open was called", () => {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      expect(mockXhr.open).toHaveBeenCalled();
    });

    it("calls open with GET request method and correct url", () => {
      const url = `/service/${serviceId}/v1/endpoints/${endpointName}`;

      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      expect(mockXhr.open).toHaveBeenCalledWith("GET", url);
    });

    it("dispatches the correct action when successful JSON returned", () => {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      const id = AppDispatcher.register(payload => {
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

    it("dispatches the correct action when successful text returned", () => {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);

      const id = AppDispatcher.register(payload => {
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

    it("dispatches the correct action when unsuccessful", () => {
      SDKEndpointsActions.fetchEndpoint(serviceId, endpointName);
      mockXhr.status = 500;

      const id = AppDispatcher.register(payload => {
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
