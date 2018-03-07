/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const Panel = require("../Panel");

let thisOnClickSpy, thisContainer, thisInstance;

describe("Panel", function() {
  beforeEach(function() {
    thisOnClickSpy = jasmine.createSpy("onClickSpy");
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <Panel
        className="foo"
        contentClass="bar"
        footer="footer"
        footerClass="qux"
        heading="heading"
        headingClass="norf"
        onClick={thisOnClickSpy}
      >
        <div className="quis" />
      </Panel>,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    it("renders children", function() {
      var child = TestUtils.findRenderedDOMComponentWithClass(
        thisInstance,
        "quis"
      );
      expect(TestUtils.isDOMComponent(child)).toBe(true);
    });

    it("renders with given className", function() {
      var panel = TestUtils.findRenderedComponentWithType(thisInstance, Panel);
      var node = ReactDOM.findDOMNode(panel);
      expect(node.className).toContain("foo");
    });

    it("overrides className to content node", function() {
      var content = TestUtils.findRenderedDOMComponentWithClass(
        thisInstance,
        "bar"
      );
      var node = ReactDOM.findDOMNode(content);
      expect(node.className).toContain("bar");
    });

    it("uses default className to content node", function() {
      var content = TestUtils.findRenderedDOMComponentWithClass(
        ReactDOM.render(<Panel />, thisContainer),
        "panel-content"
      );
      var node = ReactDOM.findDOMNode(content);
      expect(node.className).toContain("panel-content");
    });

    it("overrides className to footer node", function() {
      var footer = TestUtils.findRenderedDOMComponentWithClass(
        thisInstance,
        "bar"
      );
      var node = ReactDOM.findDOMNode(footer);
      expect(node.className).toContain("bar");
    });

    it("uses default className to footer node", function() {
      var footer = TestUtils.findRenderedDOMComponentWithClass(
        ReactDOM.render(<Panel footer="footer" />, thisContainer),
        "panel-footer"
      );
      var node = ReactDOM.findDOMNode(footer);
      expect(node.className).toContain("panel-footer");
    });

    it("does not render footer when none is given", function() {
      var panel = ReactDOM.render(<Panel />, thisContainer);
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(panel, "panel-footer")
          .length
      ).toBe(0);
    });

    it("overrides className to heading node", function() {
      var heading = TestUtils.findRenderedDOMComponentWithClass(
        thisInstance,
        "bar"
      );
      var node = ReactDOM.findDOMNode(heading);
      expect(node.className).toContain("bar");
    });

    it("uses default className to heading node", function() {
      var heading = TestUtils.findRenderedDOMComponentWithClass(
        ReactDOM.render(<Panel heading="heading" />, thisContainer),
        "panel-header"
      );
      var node = ReactDOM.findDOMNode(heading);
      expect(node.className).toContain("panel-header");
    });

    it("does not render heading when none is given", function() {
      var panel = ReactDOM.render(<Panel />, thisContainer);
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(panel, "panel-header")
          .length
      ).toBe(0);
    });

    it("is able to add an onClick to the panel node", function() {
      var panel = TestUtils.findRenderedComponentWithType(thisInstance, Panel);
      TestUtils.Simulate.click(ReactDOM.findDOMNode(panel));
      expect(thisOnClickSpy).toHaveBeenCalled();
    });
  });
});
