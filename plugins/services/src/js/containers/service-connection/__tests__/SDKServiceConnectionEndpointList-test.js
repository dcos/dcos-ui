import React from "react";
import { mount } from "enzyme";

import SDKEndpointStore from "../../../stores/SDKEndpointStore";
import Framework from "../../../structs/Framework";
import ServiceEndpoint from "../../../structs/ServiceEndpoint";
import SDKServiceConnectionEndpointList from "../SDKServiceConnectionEndpointList";

jest.mock("../../../stores/SDKEndpointStore");

const SDKService = require("./fixtures/SDKService.json");
const SDKServiceEndpoints = require("./fixtures/SDKServiceEndpoints.json");

let thisInstance;

describe("SDKServiceConnectionEndpointList", () => {
  const service = new Framework(SDKService);

  beforeEach(() => {
    SDKEndpointStore.getServiceEndpoints = () =>
      Object.entries(SDKServiceEndpoints).map(
        ([endpointName, endpoint]) =>
          new ServiceEndpoint({
            endpointName,
            endpointData: endpoint.endpointData,
            contentType: endpoint.contentType
          })
      );
    SDKEndpointStore.getServiceError = () => "";
    thisInstance = mount(
      <SDKServiceConnectionEndpointList service={service} />
    );
  });

  describe("#render", () => {
    it("renders the correct endpoints tables", () => {
      const elements = thisInstance.find(".configuration-map-section");

      expect(elements.length).toEqual(4);

      const rows = thisInstance.find(".configuration-map-row.table-row");

      expect(rows.length).toEqual(12);
    });
  });
});
