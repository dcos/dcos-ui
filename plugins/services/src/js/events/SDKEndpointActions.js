import { RequestUtil } from "mesosphere-shared-reactjs";

import AppDispatcher from "#SRC/js/events/AppDispatcher";
import {
  REQUEST_SDK_ENDPOINTS_SUCCESS,
  REQUEST_SDK_ENDPOINTS_ERROR,
  REQUEST_SDK_ENDPOINT_SUCCESS,
  REQUEST_SDK_ENDPOINT_ERROR
} from "../constants/ActionTypes";

const SDKEndpointsActions = {
  fetchEndpoints(serviceId) {
    const url = `/service/${serviceId}/v1/endpoints`;
    RequestUtil.json({
      url,
      method: "GET",
      success(endpoints) {
        AppDispatcher.handleServerAction({
          type: REQUEST_SDK_ENDPOINTS_SUCCESS,
          data: { serviceId, endpoints }
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_SDK_ENDPOINTS_ERROR,
          data: {
            serviceId,
            error: RequestUtil.parseResponseBody(xhr)
          },
          xhr
        });
      }
    });
  },

  fetchEndpoint(serviceId, endpointName) {
    const url = `/service/${serviceId}/v1/endpoints/${endpointName}`;
    const request = new XMLHttpRequest();

    request.open("GET", url);

    request.onload = function() {
      const contentType = request.getResponseHeader("Content-Type");

      AppDispatcher.handleServerAction({
        type: REQUEST_SDK_ENDPOINT_SUCCESS,
        data: {
          serviceId,
          endpointData: contentType.includes("json")
            ? JSON.parse(request.response)
            : request.response,
          contentType,
          endpointName
        }
      });
    };

    request.onerror = function() {
      AppDispatcher.handleServerAction({
        type: REQUEST_SDK_ENDPOINT_ERROR,
        data: {
          serviceId,
          error: request.response
        }
      });
    };

    request.send();
  }
};

export default SDKEndpointsActions;
