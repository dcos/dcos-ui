import React from "react";
import { mount } from "enzyme";

const Application = require("../../../structs/Application");
const ServiceConnectionEndpointList = require("../ServiceConnectionEndpointList");
const ServiceWithEndpoints = require("./fixtures/ServiceWithEndpoints.json");
const ServiceWithoutEndpoints = require("./fixtures/ServiceWithoutEndpoints.json");

describe("ServiceConnectionEndpointList", function() {
  const serviceWithEndpoints = new Application(ServiceWithEndpoints);
  const serviceWithoutEndpoints = new Application(ServiceWithoutEndpoints);

  describe("#render", function() {
    it("renders the correct endpoints page with tables", function() {
      const instance = mount(
        <ServiceConnectionEndpointList service={serviceWithEndpoints} />
      );

      const endpointsTable = instance.find(".configuration-map-section");

      expect(endpointsTable.length).toEqual(1);

      const endpointRows = instance.find(".configuration-map-row");

      expect(endpointRows.length).toEqual(5);
    });

    it("renders the no endpoints area", function() {
      const instance = mount(
        <ServiceConnectionEndpointList service={serviceWithoutEndpoints} />
      );

      const noEndpoints = instance.find(".flush-top");

      expect(noEndpoints.length).toEqual(1);
    });
  });
});
