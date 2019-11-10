/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const DetailViewHeader = require("../DetailViewHeader");

let thisContainer;

describe("DetailViewHeader", () => {
  beforeEach(() => {
    thisContainer = global.document.createElement("div");
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
      var className = {
        container: false
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
