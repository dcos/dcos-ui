/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const Pod = require("../../../structs/Pod");
const ServicePodConnectionEndpointList = require("../ServicePodConnectionEndpointList");
const ServicePodWithEndpoints = require("./fixtures/ServicePodWithEndpoints.json");

let thisContainer, thisInstance;

describe("ServicePodConnectionEndpointList", function() {
  const service = new Pod(ServicePodWithEndpoints);

  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <ServicePodConnectionEndpointList service={service} />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    it("renders the correct endpoints page with tables", function() {
      const elements = TestUtils.scryRenderedDOMComponentsWithClass(
        thisInstance,
        "configuration-map-section"
      );

      expect(elements.length).toEqual(2);

      const rows = TestUtils.scryRenderedDOMComponentsWithClass(
        thisInstance,
        "configuration-map-row table-row"
      );

      expect(rows.length).toEqual(6);
    });
  });
});
