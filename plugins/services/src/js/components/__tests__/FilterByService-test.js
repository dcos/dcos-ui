jest.dontMock("../FilterByService");
jest.dontMock("./fixtures/MockFrameworks");
jest.dontMock("../../../../../../src/js/utils/Util");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const FilterByService = require("../FilterByService");
const MockFrameworks = require("./fixtures/MockFrameworks.json");
const ServicesList = require("../../structs/ServicesList");
const Framework = require("../../structs/Framework");

describe("FilterByService", function() {
  beforeEach(function() {
    this.selectedId = MockFrameworks.frameworks[0].id;

    this.handleByServiceFilterChange = function(id) {
      this.byServiceFilter = id;
    };

    const services = new ServicesList({ items: MockFrameworks.frameworks });
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <FilterByService
        byServiceFilter={this.byServiceFilter}
        services={services.getItems()}
        totalHostsCount={10}
        handleFilterChange={this.handleByServiceFilterChange}
      />,
      this.container
    );
  });
  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it("should display 'Filter by Framework' as default item", function() {
    var node = ReactDOM.findDOMNode(this.instance);
    var buttonNode = node.querySelector(".dropdown-toggle");

    expect(buttonNode.textContent).toEqual("Filter by Service");
  });

  describe("#getItemHtml", function() {
    it("should display the badge correctly", function() {
      const framework = new Framework(MockFrameworks.frameworks[4]);
      var item = ReactDOM.render(
        this.instance.getItemHtml(framework),
        this.container
      );

      var node = ReactDOM.findDOMNode(item);
      var text = node.querySelector(".badge");

      expect(parseInt(text.textContent, 10)).toEqual(
        MockFrameworks.frameworks[4].slave_ids.length
      );
    });
  });

  describe("#getDropdownItems", function() {
    it("should return all services and the all services item", function() {
      var items = this.instance.getDropdownItems(MockFrameworks.frameworks);
      expect(items.length).toEqual(MockFrameworks.frameworks.length + 1);
    });
  });

  describe("#getSelectedId", function() {
    it("should return the same number when given a number", function() {
      expect(this.instance.getSelectedId(0)).toEqual(0);
    });

    it("should return the same string when given a string", function() {
      expect(this.instance.getSelectedId("thisIsAnID")).toEqual("thisIsAnID");
    });

    it("should return the default id when given null", function() {
      expect(this.instance.getSelectedId(null)).toEqual("default");
    });
  });
});
