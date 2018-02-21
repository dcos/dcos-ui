jest.mock("../../../stores/SDKEndpointStore");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const SDKEndpointStore = require("../../../stores/SDKEndpointStore");
const Framework = require("../../../structs/Framework");
const ServiceEndpoint = require("../../../structs/ServiceEndpoint");
const SDKServiceConnectionEndpointList = require("../SDKServiceConnectionEndpointList");
const SDKService = require("./fixtures/SDKService.json");
const SDKServiceEndpoints = require("./fixtures/SDKServiceEndpoints.json");

let thisContainer, thisInstance;

describe("SDKServiceConnectionEndpointList", function() {
  const service = new Framework(SDKService);

  beforeEach(function() {
    SDKEndpointStore.getServiceEndpoints = function() {
      return Object.entries(SDKServiceEndpoints).map(
        ([endpointName, endpoint]) =>
          new ServiceEndpoint({
            endpointName,
            endpointData: endpoint.endpointData,
            contentType: endpoint.contentType
          })
      );
    };
    SDKEndpointStore.getServiceError = function() {
      return "";
    };
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <SDKServiceConnectionEndpointList service={service} />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    it("renders the correct endpoints tables", function() {
      const elements = TestUtils.scryRenderedDOMComponentsWithClass(
        thisInstance,
        "configuration-map-section"
      );

      expect(elements.length).toEqual(4);

      const rows = TestUtils.scryRenderedDOMComponentsWithClass(
        thisInstance,
        "configuration-map-row table-row"
      );

      expect(rows.length).toEqual(12);
    });
  });
});
