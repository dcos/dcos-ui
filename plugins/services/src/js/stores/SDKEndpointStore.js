import PluginSDK from "PluginSDK";

import { SERVER_ACTION } from "#SRC/js/constants/ActionTypes";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import GetSetBaseStore from "#SRC/js/stores/GetSetBaseStore";
import Util from "#SRC/js/utils/Util";

import {
  REQUEST_SDK_ENDPOINTS_SUCCESS,
  REQUEST_SDK_ENDPOINTS_ERROR,
  REQUEST_SDK_ENDPOINT_SUCCESS,
  REQUEST_SDK_ENDPOINT_ERROR
} from "../constants/ActionTypes";

import SDKEndpointActions from "../events/SDKEndpointActions";
import ServiceEndpoint from "../structs/ServiceEndpoint";

class SDKEndpointStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      services: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const { type, data } = payload.action;
      switch (type) {
        case REQUEST_SDK_ENDPOINTS_SUCCESS:
          this.processEndpoints(data.serviceId, data.endpoints);
          break;
        case REQUEST_SDK_ENDPOINTS_ERROR:
          this.setService(data.serviceId, {
            endpoints: [],
            error: data.error.description
          });
          break;
        case REQUEST_SDK_ENDPOINT_SUCCESS:
          this.processEndpoint(
            data.serviceId,
            data.endpointName,
            data.endpointData,
            data.contentType
          );
          break;
        case REQUEST_SDK_ENDPOINT_ERROR:
          this.setService(data.serviceId, {
            endpoints: [],
            error: data.error
          });
          break;
      }

      return true;
    });
  }

  getServices() {
    return Util.deepCopy(this.get("services"));
  }

  getServiceEndpoints(serviceId) {
    const service = this.getServices()[serviceId];

    if (!service || !service.endpoints) {
      return null;
    }

    return Object.entries(service.endpoints).map(
      ([endpointName, endpoint]) =>
        new ServiceEndpoint({
          endpointName,
          endpointData: endpoint.endpointData,
          contentType: endpoint.contentType
        })
    );
  }

  getServiceError(serviceId) {
    const service = this.getServices()[serviceId];

    if (!service || !service.error) {
      return "";
    }

    return service.error;
  }

  setService(serviceId, serviceData) {
    const services = this.getServices();
    services[serviceId] = {
      endpoints: serviceData.endpoints,
      error: serviceData.error
    };

    this.set({ services });
  }

  processEndpoints(serviceId, endpointsArray) {
    const endpoints = endpointsArray.reduce(function(acc, endpointName) {
      acc[endpointName] = {};

      return acc;
    }, {});

    this.setService(serviceId, {
      endpoints,
      error: ""
    });

    endpointsArray.forEach(function(endpoint) {
      SDKEndpointActions.fetchEndpoint(serviceId, endpoint);
    }, this);
  }

  processEndpoint(serviceId, endpointName, endpointData, contentType) {
    const service = this.getServices()[serviceId];
    if (!service || !service.endpoints[endpointName]) {
      return;
    }
    service.endpoints[endpointName] = { endpointData, contentType };

    this.setService(serviceId, {
      endpoints: service.endpoints,
      error: ""
    });
  }

  get storeID() {
    return "SDKEndpoint";
  }
}

export default new SDKEndpointStore();
