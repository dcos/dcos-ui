jest.dontMock("#SRC/js/components/Breadcrumb");
jest.dontMock("#SRC/js/components/BreadcrumbCaret");
jest.dontMock("#SRC/js/components/BreadcrumbTextContent");
jest.dontMock("#SRC/js/components/BreadcrumbSupplementalContent");
jest.dontMock("#SRC/js/components/PageHeaderBreadcrumbs");
jest.dontMock("../ServiceBreadcrumbs");
jest.dontMock("../../structs/Service");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */

const TestUtils = require("react-addons-test-utils");
const Link = require("react-router").Link;
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const ServiceBreadcrumbs = require("../ServiceBreadcrumbs");
const Service = require("../../structs/Service");
const ServiceTree = require("../../structs/ServiceTree");

const renderer = TestUtils.createRenderer();

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
      renderer.render(<ServiceBreadcrumbs serviceID="/test" />);
      const result = renderer.getRenderOutput();
      expect(result.props.breadcrumbs.length).toEqual(2);
    });

    it("renders extra crumbs", function() {
      renderer.render(
        <ServiceBreadcrumbs serviceID="/test" extra={[<a>Dummy</a>]} />
      );
      const result = renderer.getRenderOutput();
      expect(result.props.breadcrumbs.length).toEqual(3);
      expect(result.props.breadcrumbs[2].props.children).toEqual("Dummy");
    });
  });

  describe("route destination", function() {
    it("provides overview route for a service that is a group", function() {
      DCOSStore.serviceTree = {
        findItemById() {
          return new ServiceTree({ id: "/foo", groups: [{ id: "/foo/bar" }] });
        }
      };
      var instance = TestUtils.renderIntoDocument(
        <ServiceBreadcrumbs serviceID="/foo/bar" />
      );

      var links = TestUtils.scryRenderedComponentsWithType(instance, Link);
      expect(links.length).toEqual(4);
      // Icon
      expect(links[0].props.to).toEqual("/services");

      // Actual of breadcrumbs
      expect(links[1].props.to).toEqual("/services");
      expect(links[2].props.to).toEqual("/services/overview/%2Ffoo");
      expect(links[3].props.to).toEqual("/services/overview/%2Ffoo%2Fbar");
    });

    it("provides detail route for a service that is not a group", function() {
      var instance = TestUtils.renderIntoDocument(
        <ServiceBreadcrumbs serviceID="/foo" />
      );

      var links = TestUtils.scryRenderedComponentsWithType(instance, Link);
      expect(links.length).toEqual(4);
      // Icon
      expect(links[0].props.to).toEqual("/services");

      // Actual of breadcrumbs
      expect(links[1].props.to).toEqual("/services");
      expect(links[2].props.to).toEqual("/services/detail/%2Ffoo");
      expect(links[3].props.to).toEqual("/services/detail/%2Ffoo");
    });
  });
});
