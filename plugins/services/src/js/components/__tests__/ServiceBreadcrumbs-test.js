jest.dontMock("../ServiceBreadcrumbs");
jest.dontMock("../../../../../../src/js/components/PageHeaderBreadcrumbs");
jest.dontMock("../../structs/Service");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const DCOSStore = require("foundation-ui").DCOSStore;
const ServiceBreadcrumbs = require("../ServiceBreadcrumbs");
const Service = require("../../structs/Service");

const renderer = TestUtils.createRenderer();
const service = new Service({
  id: "/test"
});

describe("ServiceBreadcrumbs instance", function() {
  beforeEach(function() {
    DCOSStore.serviceTree = {
      findItemById() {
        return service;
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
});
