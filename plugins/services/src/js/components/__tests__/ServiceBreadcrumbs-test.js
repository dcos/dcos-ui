import React from "react";
import { mount } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");

const Link = require("react-router").Link;
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const ServiceBreadcrumbs = require("../ServiceBreadcrumbs");
const PageHeaderBreadcrumbs = require("#SRC/js/components/PageHeaderBreadcrumbs");
const Service = require("../../structs/Service");
const ServiceTree = require("../../structs/ServiceTree");

describe("ServiceBreadcrumbs instance", function() {
  beforeEach(function() {
    DCOSStore.serviceTree = {
      findItemById() {
        return new Service({ id: "/test" });
      }
    };
  });

  describe("extra breadcrumbs", function() {
    it("does not render extra crumbs when there is none", function() {
      const result = mount(<ServiceBreadcrumbs serviceID="/test" />);
      expect(
        result.find(PageHeaderBreadcrumbs).prop("breadcrumbs").length
      ).toEqual(2);
    });

    it("renders extra crumbs", function() {
      const result = mount(
        <ServiceBreadcrumbs serviceID="/test" extra={[<a>Dummy</a>]} />
      );

      expect(
        result.find(PageHeaderBreadcrumbs).prop("breadcrumbs").length
      ).toEqual(3);
      expect(
        result.find(PageHeaderBreadcrumbs).prop("breadcrumbs")[2].props.children
      ).toEqual("Dummy");
    });
  });

  describe("route destination", function() {
    it("provides overview route for a service that is a group", function() {
      DCOSStore.serviceTree = {
        findItemById() {
          return new ServiceTree({ id: "/foo", groups: [{ id: "/foo/bar" }] });
        }
      };
      const instance = mount(<ServiceBreadcrumbs serviceID="/foo/bar" />);

      const links = instance.find(Link);
      expect(links.length).toEqual(4);
      // Icon
      expect(links.at(0).prop("to")).toEqual("/services");

      // Actual of breadcrumbs
      expect(links.at(1).prop("to")).toEqual("/services");
      expect(links.at(2).prop("to")).toEqual("/services/overview/%2Ffoo");
      expect(links.at(3).prop("to")).toEqual("/services/overview/%2Ffoo%2Fbar");
    });

    it("provides detail route for a service that is not a group", function() {
      const instance = mount(<ServiceBreadcrumbs serviceID="/foo" />);

      const links = instance.find(Link);
      expect(links.length).toEqual(4);
      // Icon
      expect(links.at(0).prop("to")).toEqual("/services");

      // Actual of breadcrumbs
      expect(links.at(1).prop("to")).toEqual("/services");
      expect(links.at(2).prop("to")).toEqual("/services/detail/%2Ffoo");
      expect(links.at(3).prop("to")).toEqual("/services/detail/%2Ffoo");
    });
  });
});
