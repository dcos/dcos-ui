/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");

const Mount = require("../Mount");
const { MountService } = require("../index");

describe("Mount", function() {
  const FirstTestComponent = function(props) {
    return <div className="component">{props.message}</div>;
  };

  const SecondTestComponent = function(props) {
    return <div className="component">{props.message}</div>;
  };

  beforeEach(function() {
    MountService.registerComponent(FirstTestComponent, "mount-test");
  });

  afterEach(function() {
    MountService.unregisterComponent(FirstTestComponent, "mount-test");
    MountService.unregisterComponent(SecondTestComponent, "mount-test");
  });

  it("renders one by default", function() {
    const result = TestUtils.renderIntoDocument(
      <Mount type="children-test">
        <span>foo</span>
      </Mount>
    );

    expect(
      TestUtils.findRenderedDOMComponentWithTag(result, "span")
    ).toBeDefined();
  });

  it("renders multiple children by default", function() {
    const result = TestUtils.renderIntoDocument(
      <Mount type="children-test">
        <strong>foo</strong>
        <em>bar</em>
      </Mount>
    );

    expect(
      TestUtils.findRenderedDOMComponentWithTag(result, "strong")
    ).toBeDefined();
    expect(
      TestUtils.findRenderedDOMComponentWithTag(result, "em")
    ).toBeDefined();
  });

  it("renders null if no component is registered and no children defined", function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Mount type="children-test" />);

    expect(renderer.getRenderOutput()).toBe(null);
  });

  it("doesnt wrap a single child", function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Mount type="foo">
        <span>foo</span>
      </Mount>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), "span")).toBe(
      true
    );
  });

  it("always wraps elements if configured", function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Mount type="foo" alwaysWrap={true}>
        <span>foo</span>
      </Mount>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), "div")).toBe(
      true
    );
  });

  it("wraps elements with provided wrapper", function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Mount type="foo" wrapper="p" alwaysWrap={true}>
        <span>foo</span>
      </Mount>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), "p")).toBe(
      true
    );
  });

  it("renders registered components", function() {
    const dom = TestUtils.renderIntoDocument(
      <Mount type="mount-test">
        <span>foo</span>
      </Mount>
    );

    const result = TestUtils.scryRenderedDOMComponentsWithClass(
      dom,
      "component"
    );

    expect(result.length).toBe(1);
  });

  it("replaces children with registered components", function() {
    const dom = TestUtils.renderIntoDocument(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    const result = TestUtils.scryRenderedDOMComponentsWithClass(dom, "child");

    expect(result.length).toBe(0);
  });

  it("updates if new component was registered", function() {
    const dom = TestUtils.renderIntoDocument(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    MountService.registerComponent(SecondTestComponent, "mount-test");

    const result = TestUtils.scryRenderedDOMComponentsWithClass(
      dom,
      "component"
    );

    expect(result.length).toBe(2);
  });

  it("updates if new component was unregistered", function() {
    const dom = TestUtils.renderIntoDocument(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    MountService.unregisterComponent(FirstTestComponent, "mount-test");

    const result = TestUtils.scryRenderedDOMComponentsWithClass(dom, "child");

    expect(result.length).toBe(1);
  });

  it("passes down properties", function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Mount type="mount-test" message="hello world">
        <span>foo</span>
      </Mount>
    );

    expect(renderer.getRenderOutput().props).toEqual({
      message: "hello world"
    });
  });
});
