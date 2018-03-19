import React from "react";
import { mount } from "enzyme";

jest.mock("../../../stores/SDKEndpointStore");

const SDKEndpointStore = require("../../../stores/SDKEndpointStore");
const Framework = require("../../../structs/Framework");
const ServiceEndpoint = require("../../../structs/ServiceEndpoint");
const SDKServiceConnectionEndpointList = require("../SDKServiceConnectionEndpointList");
const SDKService = require("./fixtures/SDKService.json");
const SDKServiceEndpoints = require("./fixtures/SDKServiceEndpoints.json");

let thisInstance;

describe("SDKServiceConnectionEndpointList", function() {
  const service = new Framework(SDKService);

  beforeEach(function() {
    SDKEndpointStore.getServiceEndpoints = function() {
      return Object.entries(SDKServiceEndpoints).map(
        ([endpointName, endpoint]) =>
          new ServiceEndpoint({
            endpointName,
            endpointData: endpoint.endpointData,
            contentType: endpoint.contentType
          })
      );
    };
    SDKEndpointStore.getServiceError = function() {
      return "";
    };
    thisInstance = mount(
      <SDKServiceConnectionEndpointList service={service} />
    );
  });

  describe("#render", function() {
    it("renders the correct endpoints tables", function() {
      const elements = thisInstance.find(".configuration-map-section");

      expect(elements.length).toEqual(4);

      const rows = thisInstance.find(".configuration-map-row.table-row");

      expect(rows.length).toEqual(12);
    });
  });
});
