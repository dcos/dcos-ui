import * as React from "react";
import ReactDOM from "react-dom";
import FilterByFramework from "../FilterByFramework";
import FrameworksList from "../../structs/ServicesList";
import Framework from "../../structs/Framework";
import MockFrameworks from "./fixtures/MockFrameworks.json";

let thisHandleByFrameworkFilterChange,
  thisByFrameworkFilter,
  thisContainer,
  thisInstance;

describe("FilterByFramework", () => {
  beforeEach(() => {
    thisHandleByFrameworkFilterChange = id => {
      thisByFrameworkFilter = id;
    };

    const frameworks = new FrameworksList({ items: MockFrameworks.frameworks });
    thisContainer = window.document.createElement("div");
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
  afterEach(() => {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("displays 'Filter by Framework' as default item", () => {
    const node = ReactDOM.findDOMNode(thisInstance);
    const buttonNode = node.querySelector(".dropdown-toggle");

    expect(buttonNode.textContent).toEqual("Filter by Framework");
  });

  describe("#getItemHtml", () => {
    it("displays the badge correctly", () => {
      const framework = new Framework(MockFrameworks.frameworks[4]);
      const item = ReactDOM.render(
        thisInstance.getItemHtml(framework),
        thisContainer
      );

      const node = ReactDOM.findDOMNode(item);
      const text = node.querySelector(".badge-container-text + span");

      expect(parseInt(text.textContent, 10)).toEqual(
        MockFrameworks.frameworks[4].slave_ids.length
      );
    });
  });

  describe("#getDropdownItems", () => {
    it("returns all frameworks and the all frameworks item", () => {
      const items = thisInstance.getDropdownItems(MockFrameworks.frameworks);
      expect(items.length).toEqual(MockFrameworks.frameworks.length + 1);
    });
  });
});
