import FilterByFramework from "../FilterByFramework";

const React = require("react");
const ReactDOM = require("react-dom");

const MockFrameworks = require("./fixtures/MockFrameworks.json");
const FrameworksList = require("../../structs/ServicesList");
const Framework = require("../../structs/Framework");

let thisHandleByFrameworkFilterChange,
  thisByFrameworkFilter,
  thisContainer,
  thisInstance;

describe("FilterByFramework", function() {
  beforeEach(function() {
    thisHandleByFrameworkFilterChange = function(id) {
      thisByFrameworkFilter = id;
    };

    const frameworks = new FrameworksList({ items: MockFrameworks.frameworks });
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <FilterByFramework
        byFrameworkFilter={thisByFrameworkFilter}
        frameworks={frameworks.getItems()}
        totalHostsCount={10}
        handleFilterChange={thisHandleByFrameworkFilterChange}
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

    expect(buttonNode.textContent).toEqual("Filter by Framework");
  });

  describe("#getItemHtml", function() {
    it("displays the badge correctly", function() {
      const framework = new Framework(MockFrameworks.frameworks[4]);
      var item = ReactDOM.render(
        thisInstance.getItemHtml(framework),
        thisContainer
      );

      var node = ReactDOM.findDOMNode(item);
      var text = node.querySelector(".badge-container-text + span");

      expect(parseInt(text.textContent, 10)).toEqual(
        MockFrameworks.frameworks[4].slave_ids.length
      );
    });
  });

  describe("#getDropdownItems", function() {
    it("returns all frameworks and the all frameworks item", function() {
      var items = thisInstance.getDropdownItems(MockFrameworks.frameworks);
      expect(items.length).toEqual(MockFrameworks.frameworks.length + 1);
    });
  });
});
