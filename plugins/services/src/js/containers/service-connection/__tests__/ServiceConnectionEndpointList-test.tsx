import * as React from "react";
import { mount } from "enzyme";

import Application from "../../../structs/Application";
import ServiceConnectionEndpointList from "../ServiceConnectionEndpointList";
import ServiceWithEndpoints from "./fixtures/ServiceWithEndpoints.json";

describe("ServiceConnectionEndpointList", () => {
  const serviceWithEndpoints = new Application(ServiceWithEndpoints);

  describe("#render", () => {
    it("renders the correct endpoints page with tables", () => {
      const instance = mount(
        <ServiceConnectionEndpointList service={serviceWithEndpoints} />
      );

      const endpointsTable = instance.find(".configuration-map-section");

      expect(endpointsTable.length).toEqual(2);

      const endpointRows = instance.find(".configuration-map-row");

      expect(endpointRows.length).toEqual(8);

      expect(instance.find('.configuration-map-value').at(1).text()).toEqual("8082")
      expect(instance.find('.configuration-map-value').at(6).text()).toEqual("8443")
    });
  });
});
