import * as React from "react";
import { mount } from "enzyme";

import SDKEndpointStore from "../../../stores/SDKEndpointStore";
import Framework from "../../../structs/Framework";
import ServiceEndpoint from "../../../structs/ServiceEndpoint";
import SDKServiceConnectionEndpointList from "../SDKServiceConnectionEndpointList";
import SDKService from "./fixtures/SDKService.json";
import SDKServiceEndpoints from "./fixtures/SDKServiceEndpoints.json";

jest.mock("../../../stores/SDKEndpointStore");

let thisInstance: { find: (_: string) => any };

describe("SDKServiceConnectionEndpointList", () => {
  const service = new Framework(SDKService);

  beforeEach(() => {
    SDKEndpointStore.getServiceEndpoints = () =>
      Object.entries(SDKServiceEndpoints).map(
        ([endpointName, endpoint]) =>
          new ServiceEndpoint({
            endpointName,
            endpointData: endpoint.endpointData,
            contentType: endpoint.contentType,
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
