import React from "react";
import { mount } from "enzyme";

const Application = require("../../../structs/Application");
const ServiceConnectionEndpointList = require("../ServiceConnectionEndpointList");
const ServiceWithEndpoints = require("./fixtures/ServiceWithEndpoints.json");

describe("ServiceConnectionEndpointList", () => {
  const serviceWithEndpoints = new Application(ServiceWithEndpoints);

  describe("#render", () => {
    it("renders the correct endpoints page with tables", () => {
      const instance = mount(
        <ServiceConnectionEndpointList service={serviceWithEndpoints} />
      );

      const endpointsTable = instance.find(".configuration-map-section");

      expect(endpointsTable.length).toEqual(1);

      const endpointRows = instance.find(".configuration-map-row");

      expect(endpointRows.length).toEqual(4);
    });
  });
});
