import PluginSDK from "PluginSDK";

import { SERVER_ACTION } from "#SRC/js/constants/ActionTypes";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import GetSetBaseStore from "#SRC/js/stores/GetSetBaseStore";

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

    const self = this;

    this.getSet_data = {
      services: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(function(payload) {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const { type, data } = payload.action;
      switch (type) {
        case REQUEST_SDK_ENDPOINTS_SUCCESS:
          self.processEndpoints(data.serviceId, data.endpoints);
          break;
        case REQUEST_SDK_ENDPOINTS_ERROR:
          self.setServiceEndpoints(data.serviceId, {
            endpoints: [],
            error: data.error.description
          });
          break;
        case REQUEST_SDK_ENDPOINT_SUCCESS:
          self.processEndpoint(
            data.serviceId,
            data.endpointName,
            data.endpointData,
            data.contentType
          );
          break;
        case REQUEST_SDK_ENDPOINT_ERROR:
          self.setServiceEndpoints(data.serviceId, {
            endpoints: [],
            error: data.error
          });
          break;
      }

      return true;
    });
  }

  getServices() {
    const services = Object.assign({}, this.get("services"));

    Object.keys(services).forEach(serviceId => {
      const service = Object.assign({}, services[serviceId]);
      Object.keys(service.endpoints).forEach(endpointName => {
        service.endpoints[endpointName] = Object.assign(
          {},
          service.endpoints[endpointName]
        );
      });
      services[serviceId] = service;
    });

    return services;
  }

  getService(serviceId) {
    const service = this.getServices()[serviceId];

    if (!service || !service.endpoints) {
      return null;
    }

    const endpoints = Object.entries(service.endpoints).map(
      ([endpointName, endpoint]) =>
        new ServiceEndpoint({
          endpointName,
          endpointData: endpoint.endpointData,
          contentType: endpoint.contentType
        })
    );

    service.endpoints = endpoints;

    return service;
  }

  setServiceEndpoints(serviceId, serviceData) {
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

    this.setServiceEndpoints(serviceId, {
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

    this.setServiceEndpoints(serviceId, {
      endpoints: service.endpoints,
      error: ""
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  get storeID() {
    return "SDKEndpoint";
  }
}

module.exports = new SDKEndpointStore();
