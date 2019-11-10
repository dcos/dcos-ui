const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const SDKEndpointStore = require("../SDKEndpointStore");
const ServiceEndpoint = require("../../structs/ServiceEndpoint");
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

describe("SDKEndpointStore", () => {
  it("stores service by id", () => {
    const service = {
      endpoints: [],
      error: null
    };

    SDKEndpointStore.setService(serviceId, service);

    const services = SDKEndpointStore.get("services");

    expect(services).toEqual({
      [serviceId]: service
    });
  });

  it("returns an instance of ServiceEndpoint", () => {
    const service = {
      endpoints: [serviceData.endpoints[0]],
      error: null
    };

    SDKEndpointStore.setService(serviceId, service);
    const endpoints = SDKEndpointStore.getServiceEndpoints(serviceId);

    expect(endpoints[0] instanceof ServiceEndpoint).toBeTruthy();
  });

  it("fetches endpoints", () => {
    spyOn(SDKEndpointActions, "fetchEndpoint");

    SDKEndpointStore.processEndpoints(serviceId, endpoints);

    expect(SDKEndpointActions.fetchEndpoint).toHaveBeenCalledTimes(5);
  });

  it("sets new endpoint to service", () => {
    const endpoint = serviceData.endpoints[0];
    const service = {
      endpoints: {
        [endpoints[0]]: {}
      },
      error: ""
    };

    SDKEndpointStore.setService(serviceId, service);
    SDKEndpointStore.processEndpoint(
      serviceId,
      "coordinator-http",
      endpoint.endpointData,
      "application/text"
    );

    const expectedResult = [
      new ServiceEndpoint({
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
    ];

    expect(SDKEndpointStore.getServiceEndpoints(serviceId)).toEqual(
      expectedResult
    );
  });

  describe("dispatcher", () => {
    it("calls setService with correct args when REQUEST_SDK_ENDPOINTS_ERROR is dispatched", () => {
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
        error: "error message"
      });
    });

    it("calls processEndpoints when REQUEST_SDK_ENDPOINTS_SUCCESS is dispatched ", () => {
      spyOn(SDKEndpointStore, "processEndpoints");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINTS_SUCCESS,
        data: {
          serviceId,
          endpoints
        }
      });

      expect(SDKEndpointStore.processEndpoints).toHaveBeenCalledWith(
        serviceId,
        endpoints
      );
    });

    it("calls processEndpoint when REQUEST_SDK_ENDPOINT_SUCCESS is dispatched ", () => {
      const data = serviceData.endpoints[0];

      spyOn(SDKEndpointStore, "processEndpoint");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SDK_ENDPOINT_SUCCESS,
        data
      });

      expect(SDKEndpointStore.processEndpoint).toHaveBeenCalledWith(
        data.serviceId,
        data.endpointName,
        data.endpointData,
        data.contentType
      );
    });

    it("calls setService when REQUEST_SDK_ENDPOINT_SUCCESS is dispatched ", () => {
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
        error: "error message"
      });
    });
  });
});
