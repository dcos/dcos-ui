jest.dontMock("../Panel");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const Panel = require("../Panel");

describe("Panel", function() {
  beforeEach(function() {
    this.onClickSpy = jasmine.createSpy("onClickSpy");
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <Panel
        className="foo"
        contentClass="bar"
        footer="footer"
        footerClass="qux"
        heading="heading"
        headingClass="norf"
        onClick={this.onClickSpy}
      >
        <div className="quis" />
      </Panel>,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#render", function() {
    it("should render children", function() {
      var child = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "quis"
      );
      expect(TestUtils.isDOMComponent(child)).toBe(true);
    });

    it("should render with given className", function() {
      var panel = TestUtils.findRenderedComponentWithType(this.instance, Panel);
      var node = ReactDOM.findDOMNode(panel);
      expect(node.className).toContain("foo");
    });

    it("should override className to content node", function() {
      var content = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "bar"
      );
      var node = ReactDOM.findDOMNode(content);
      expect(node.className).toContain("bar");
    });

    it("should use default className to content node", function() {
      var content = TestUtils.findRenderedDOMComponentWithClass(
        ReactDOM.render(<Panel />, this.container),
        "panel-content"
      );
      var node = ReactDOM.findDOMNode(content);
      expect(node.className).toContain("panel-content");
    });

    it("should override className to footer node", function() {
      var footer = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "bar"
      );
      var node = ReactDOM.findDOMNode(footer);
      expect(node.className).toContain("bar");
    });

    it("should use default className to footer node", function() {
      var footer = TestUtils.findRenderedDOMComponentWithClass(
        ReactDOM.render(<Panel footer="footer" />, this.container),
        "panel-footer"
      );
      var node = ReactDOM.findDOMNode(footer);
      expect(node.className).toContain("panel-footer");
    });

    it("should not render footer when none is given", function() {
      var panel = ReactDOM.render(<Panel />, this.container);
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(panel, "panel-footer")
          .length
      ).toBe(0);
    });

    it("should override className to heading node", function() {
      var heading = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "bar"
      );
      var node = ReactDOM.findDOMNode(heading);
      expect(node.className).toContain("bar");
    });

    it("should use default className to heading node", function() {
      var heading = TestUtils.findRenderedDOMComponentWithClass(
        ReactDOM.render(<Panel heading="heading" />, this.container),
        "panel-header"
      );
      var node = ReactDOM.findDOMNode(heading);
      expect(node.className).toContain("panel-header");
    });

    it("should not render heading when none is given", function() {
      var panel = ReactDOM.render(<Panel />, this.container);
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(panel, "panel-header")
          .length
      ).toBe(0);
    });

    it("should be able to add an onClick to the panel node", function() {
      var panel = TestUtils.findRenderedComponentWithType(this.instance, Panel);
      TestUtils.Simulate.click(ReactDOM.findDOMNode(panel));
      expect(this.onClickSpy).toHaveBeenCalled();
    });
  });
});
