/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const Pod = require("../../../structs/Pod");
const ServicePodConnectionEndpointList = require("../ServicePodConnectionEndpointList");
const ServicePodWithEndpoints = require("./fixtures/ServicePodWithEndpoints.json");

describe("ServicePodConnectionEndpointList", function() {
  const service = new Pod(ServicePodWithEndpoints);

  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <ServicePodConnectionEndpointList service={service} />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#render", function() {
    it("renders the correct endpoints page with tables", function() {
      const elements = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "configuration-map-section"
      );

      expect(elements.length).toEqual(2);

      const rows = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "configuration-map-row table-row"
      );

      expect(rows.length).toEqual(6);
    });
  });
});
