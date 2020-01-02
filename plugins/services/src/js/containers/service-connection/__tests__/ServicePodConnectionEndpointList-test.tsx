import * as React from "react";
import { mount } from "enzyme";

import Pod from "../../../structs/Pod";
import ServicePodConnectionEndpointList from "../ServicePodConnectionEndpointList";
import ServicePodWithEndpoints from "./fixtures/ServicePodWithEndpoints.json";

let thisInstance;

describe("ServicePodConnectionEndpointList", () => {
  const service = new Pod(ServicePodWithEndpoints);

  beforeEach(() => {
    thisInstance = mount(
      <ServicePodConnectionEndpointList service={service} />
    );
  });

  describe("#render", () => {
    it("renders the correct endpoints page with tables", () => {
      const elements = thisInstance.find(".configuration-map-section");
      expect(elements.length).toEqual(2);

      const rows = thisInstance.find(".configuration-map-row.table-row");
      expect(rows.length).toEqual(8);
    });
  });
});
