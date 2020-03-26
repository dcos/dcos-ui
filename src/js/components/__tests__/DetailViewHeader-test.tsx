import DetailViewHeader from "../DetailViewHeader";

import * as React from "react";
import ReactDOM from "react-dom";

let thisContainer;

describe("DetailViewHeader", () => {
  beforeEach(() => {
    thisContainer = window.document.createElement("div");
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", () => {
    it("allows classes to be added", () => {
      const className = "foo";
      const instance = ReactDOM.render(
        <DetailViewHeader className={className} />,
        thisContainer
      );
      const node = ReactDOM.findDOMNode(instance);
      // node.classList causes Jest to OOM ¯\_(ツ)_/¯
      expect(node.getAttribute("class")).toContain("foo");
    });

    it("allows classes to be removed", () => {
      const className = {
        container: false,
      };
      const instance = ReactDOM.render(
        <DetailViewHeader className={className} />,
        thisContainer
      );
      const node = ReactDOM.findDOMNode(instance);
      expect(node.getAttribute("class")).not.toContain("container");
    });
  });
});
