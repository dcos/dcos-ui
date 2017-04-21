jest.dontMock("../DetailViewHeader");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const DetailViewHeader = require("../DetailViewHeader");

describe("DetailViewHeader", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#render", function() {
    it("allows classes to be added", function() {
      const className = "foo";
      const instance = ReactDOM.render(
        <DetailViewHeader className={className} />,
        this.container
      );
      const node = ReactDOM.findDOMNode(instance);
      // node.classList causes Jest to OOM ¯\_(ツ)_/¯
      expect(node.getAttribute("class")).toContain("foo");
    });

    it("allows classes to be removed", function() {
      var className = {
        container: false
      };
      const instance = ReactDOM.render(
        <DetailViewHeader className={className} />,
        this.container
      );
      const node = ReactDOM.findDOMNode(instance);
      expect(node.getAttribute("class")).not.toContain("container");
    });
  });
});
