const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const SDKEndpointStore = require("../SDKEndpointStore");
const SDKServiceEndpoint = require("../../structs/SDKServiceEndpoint");
const SDKEndpointActions = require("../../events/SDKEndpointActions");

const serviceData = {
  endpoints: [
    {
      serviceId: "/elastic",
      endpointName: "coordinator-http",
      endpointData: {
        address: ["10.0.3.171:1026"],
        dns: ["coordinator-0-node.elastic.autoip.dcos.thisdcos.directory:1026"],
        vip: "coordinator.elastic.l4lb.thisdcos.directory:9200"
      },
      contentType: "application/json"
    }
  ],
  totalLoadingEndpointsCount: 3,
  error: ""
};
const endpoints = [
  "coordinator-http",
  "coordinator-transport",
  "data-http",
  "data-transport,master-http",
  "master-transport"
];
const serviceId = "/arangodb";

describe("SDKEndpointStore", function() {
  it("stores service by id", function() {
    const service = {
      endpoints: [],
      totalLoadingEndpointsCount: -1,
      error: null
    };

    SDKEndpointStore.setService(serviceId, service);

    const services = SDKEndpointStore.get("services");

    expect(services).toEqual({
      [serviceId]: service
    });
  });

  it("return an instance of SDKServiceEndpoint", function() {
    const service = {
      endpoints: [serviceData.endpoints[0]],
      totalLoadingEndpointsCount: -1,
      error: null
    };

    SDKEndpointStore.setService(serviceId, service);
    const SDKEndpointService = SDKEndpointStore.getSDKEndpointService(
      serviceId
    );

    expect(
      SDKEndpointService.endpoints[0] instanceof SDKServiceEndpoint
    ).toBeTruthy();
  });

  it("fetch endpoints", function() {
    spyOn(SDKEndpointActions, "fetchEndpoint");

    SDKEndpointStore.processNewEndpoints(serviceId, endpoints);

    expect(SDKEndpointActions.fetchEndpoint).toHaveBeenCalledTimes(5);
  });

  it("set new endpoint to service", function() {
    const endpoint = serviceData.endpoints[0];
    const service = {
      endpoints: {
        [endpoints[0]]: {}
      },
      totalLoadingEndpointsCount: 3,
      error: ""
    };

    SDKEndpointStore.setService(serviceId, service);
    SDKEndpointStore.processNewEndpoint(
      serviceId,
      "coordinator-http",
      endpoint.endpointData,
      "application/text"
    );

    const expectedResult = {
      endpoints: [
        new SDKServiceEndpoint({
          endpointName: "coordinator-http",
          endpointData: {
            address: ["10.0.3.171:1026"],
            dns: [
              "coordinator-0-node.elastic.autoip.dcos.thisdcos.directory:1026"
            ],
            vip: "coordinator.elastic.l4lb.thisdcos.directory:9200"
          },
          contentType: "application/text"
        })
      ],
      totalLoadingEndpointsCount: 3,
      error: ""
    };

    expect(SDKEndpointStore.getSDKEndpointService(serviceId)).toEqual(
      expectedResult
    );
  });

  describe("dispatcher", function() {
    it("call setService with correct args when REQUEST_SDK_ENDPOINTS_LOADING dispatched", function() {
      spyOn(SDKEndpointStore, "setService");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINTS_LOADING,
        data: { serviceId }
      });

      expect(SDKEndpointStore.setService).toHaveBeenCalledWith(serviceId, {
        endpoints: [],
        totalLoadingEndpointsCount: -1,
        error: null
      });
    });

    it("call setService with correct args when REQUEST_SDK_ENDPOINTS_ERROR is dispatched", function() {
      spyOn(SDKEndpointStore, "setService");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINTS_ERROR,
        data: {
          serviceId,
          error: {
            description: "error message"
          }
        }
      });

      expect(SDKEndpointStore.setService).toHaveBeenCalledWith(serviceId, {
        endpoints: [],
        totalLoadingEndpointsCount: -1,
        error: "error message"
      });
    });

    it("call processNewEndpoints when REQUEST_SDK_ENDPOINTS_SUCCESS is dispatched ", function() {
      spyOn(SDKEndpointStore, "processNewEndpoints");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINTS_SUCCESS,
        data: {
          serviceId,
          endpoints
        }
      });

      expect(SDKEndpointStore.processNewEndpoints).toHaveBeenCalledWith(
        serviceId,
        endpoints
      );
    });

    it("call processNewEndpoint when REQUEST_SDK_ENDPOINT_SUCCESS is dispatched ", function() {
      const data = serviceData.endpoints[0];

      spyOn(SDKEndpointStore, "processNewEndpoint");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINT_SUCCESS,
        data
      });

      expect(SDKEndpointStore.processNewEndpoint).toHaveBeenCalledWith(
        data.serviceId,
        data.endpointName,
        data.endpointData,
        data.contentType
      );
    });

    it("call setService when REQUEST_SDK_ENDPOINT_SUCCESS is dispatched ", function() {
      spyOn(SDKEndpointStore, "setService");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINT_ERROR,
        data: {
          serviceId,
          error: "error message"
        }
      });

      expect(SDKEndpointStore.setService).toHaveBeenCalledWith(serviceId, {
        endpoints: [],
        totalLoadingEndpointsCount: -1,
        error: "error message"
      });
    });
  });
});
