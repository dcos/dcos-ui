import React from "react";
import { mount } from "enzyme";

const Pod = require("../../../structs/Pod");
const ServicePodConnectionEndpointList = require("../ServicePodConnectionEndpointList");
const ServicePodWithEndpoints = require("./fixtures/ServicePodWithEndpoints.json");

let thisInstance;

describe("ServicePodConnectionEndpointList", function() {
  const service = new Pod(ServicePodWithEndpoints);

  beforeEach(function() {
    thisInstance = mount(
      <ServicePodConnectionEndpointList service={service} />
    );
  });

  describe("#render", function() {
    it("renders the correct endpoints page with tables", function() {
      const elements = thisInstance.find(".configuration-map-section");
      expect(elements.length).toEqual(2);

      const rows = thisInstance.find(".configuration-map-row.table-row");
      expect(rows.length).toEqual(6);
    });
  });
});
