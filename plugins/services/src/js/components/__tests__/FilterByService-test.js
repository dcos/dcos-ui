/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const FilterByService = require("../FilterByService");
const MockFrameworks = require("./fixtures/MockFrameworks.json");
const ServicesList = require("../../structs/ServicesList");
const Framework = require("../../structs/Framework");

let thisSelectedId,
  thisHandleByServiceFilterChange,
  thisByServiceFilter,
  thisContainer,
  thisInstance;

describe("FilterByService", function() {
  beforeEach(function() {
    thisSelectedId = MockFrameworks.frameworks[0].id;

    thisHandleByServiceFilterChange = function(id) {
      thisByServiceFilter = id;
    };

    const services = new ServicesList({ items: MockFrameworks.frameworks });
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <FilterByService
        byServiceFilter={thisByServiceFilter}
        services={services.getItems()}
        totalHostsCount={10}
        handleFilterChange={thisHandleByServiceFilterChange}
      />,
      thisContainer
    );
  });
  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("displays 'Filter by Framework' as default item", function() {
    var node = ReactDOM.findDOMNode(thisInstance);
    var buttonNode = node.querySelector(".dropdown-toggle");

    expect(buttonNode.textContent).toEqual("Filter by Service");
  });

  describe("#getItemHtml", function() {
    it("displays the badge correctly", function() {
      const framework = new Framework(MockFrameworks.frameworks[4]);
      var item = ReactDOM.render(
        thisInstance.getItemHtml(framework),
        thisContainer
      );

      var node = ReactDOM.findDOMNode(item);
      var text = node.querySelector(".badge");

      expect(parseInt(text.textContent, 10)).toEqual(
        MockFrameworks.frameworks[4].slave_ids.length
      );
    });
  });

  describe("#getDropdownItems", function() {
    it("returns all services and the all services item", function() {
      var items = thisInstance.getDropdownItems(MockFrameworks.frameworks);
      expect(items.length).toEqual(MockFrameworks.frameworks.length + 1);
    });
  });

  describe("#getSelectedId", function() {
    it("returns the same number when given a number", function() {
      expect(thisInstance.getSelectedId(0)).toEqual(0);
    });

    it("returns the same string when given a string", function() {
      expect(thisInstance.getSelectedId("thisIsAnID")).toEqual("thisIsAnID");
    });

    it("returns the default id when given null", function() {
      expect(thisInstance.getSelectedId(null)).toEqual("default");
    });
  });
});
