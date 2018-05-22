import { mount, shallow } from "enzyme";
import React from "react";

jest.mock("#SRC/js/stores/DCOSStore");

const Link = require("react-router").Link;
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const ServiceBreadcrumbs = require("../ServiceBreadcrumbs");
const PageHeaderBreadcrumbs = require("#SRC/js/components/PageHeaderBreadcrumbs");
const Service = require("../../structs/Service");
const ServiceTree = require("../../structs/ServiceTree");

describe("ServiceBreadcrumbs", function() {
  describe("instance", function() {
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
          result.find(PageHeaderBreadcrumbs).prop("breadcrumbs")[2].props
            .children
        ).toEqual("Dummy");
      });
    });

    describe("route destination", function() {
      it("provides overview route for a service that is a group", function() {
        DCOSStore.serviceTree = {
          findItemById() {
            return new ServiceTree({
              id: "/foo",
              groups: [{ id: "/foo/bar" }]
            });
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
        expect(links.at(3).prop("to")).toEqual(
          "/services/overview/%2Ffoo%2Fbar"
        );
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
  describe("shouldComponentUpdate", function() {
    it(`is updating serviceID`, function() {
      const wrapper = shallow(
        <ServiceBreadcrumbs {...{ serviceID: "/test" }} />
      );
      const componentDidUpdateSpy = jest.spyOn(
        wrapper.instance(),
        "componentDidUpdate"
      );
      wrapper.setProps({ serviceID: "/success" });
      expect(componentDidUpdateSpy.mock.calls.length).toBe(1);
    });

    it(`is not updating on same serviceID`, function() {
      const wrapper = shallow(
        <ServiceBreadcrumbs {...{ serviceID: "/same" }} />
      );
      const componentDidUpdateSpy = jest.spyOn(
        wrapper.instance(),
        "componentDidUpdate"
      );
      wrapper.setProps({ serviceID: "/same" });
      expect(componentDidUpdateSpy.mock.calls.length).toBe(0);
    });

    it(`is updating taskName`, function() {
      const wrapper = shallow(
        <ServiceBreadcrumbs
          {...{ serviceID: "/service", taskID: "1234", taskName: "test" }}
        />
      );
      const componentDidUpdateSpy = jest.spyOn(
        wrapper.instance(),
        "componentDidUpdate"
      );
      wrapper.setProps({
        serviceID: "/service",
        taskID: "1234",
        taskName: "success"
      });
      expect(componentDidUpdateSpy.mock.calls.length).toBe(1);
    });

    it(`is updating not updating for same taskName`, function() {
      const wrapper = shallow(
        <ServiceBreadcrumbs
          {...{ serviceID: "/service", taskID: "1234", taskName: "test" }}
        />
      );
      const componentDidUpdateSpy = jest.spyOn(
        wrapper.instance(),
        "componentDidUpdate"
      );
      wrapper.setProps({
        serviceID: "/service",
        taskID: "1234",
        taskName: "test"
      });
      expect(componentDidUpdateSpy.mock.calls.length).toBe(0);
    });

    it(`is updating extras`, function() {
      const wrapper = shallow(
        <ServiceBreadcrumbs
          {...{ serviceID: "/service", extra: <span>test</span> }}
        />
      );
      const componentDidUpdateSpy = jest.spyOn(
        wrapper.instance(),
        "componentDidUpdate"
      );
      wrapper.setProps({
        serviceID: "/service",
        extra: <span>changed</span>
      });
      expect(componentDidUpdateSpy.mock.calls.length).toBe(1);
    });

    it(`is updating not updating for same taskName`, function() {
      const wrapper = shallow(
        <ServiceBreadcrumbs
          {...{ serviceID: "/service", extra: <span>same</span> }}
        />
      );
      const componentDidUpdateSpy = jest.spyOn(
        wrapper.instance(),
        "componentDidUpdate"
      );
      wrapper.setProps({
        serviceID: "/service",
        extra: <span>same</span>
      });
      expect(componentDidUpdateSpy.mock.calls.length).toBe(0);
    });
  });
});
