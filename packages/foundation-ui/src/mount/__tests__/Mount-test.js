/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { shallow } from "enzyme";

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
    const result = shallow(
      <Mount type="children-test">
        <span>foo</span>
      </Mount>
    );

    expect(result.containsAllMatchingElements([<span>foo</span>])).toBeTruthy();
  });

  it("renders multiple children by default", function() {
    const result = shallow(
      <Mount type="children-test">
        <strong>foo</strong>
        <em>bar</em>
      </Mount>
    );

    expect(
      result.containsAllMatchingElements([<strong>foo</strong>, <em>bar</em>])
    ).toBeTruthy();
  });

  it("renders null if no component is registered and no children defined", function() {
    const result = shallow(<Mount type="children-test" />);

    expect(result.children().exists()).toBeFalsy();
  });

  it("doesnt wrap a single child", function() {
    const result = shallow(
      <Mount type="foo">
        <span>foo</span>
      </Mount>
    );

    expect(result.type()).toBe("span");
  });

  it("always wraps elements if configured", function() {
    const result = shallow(
      <Mount type="foo" alwaysWrap>
        <span>foo</span>
      </Mount>
    );

    expect(result.type()).toBe("div");
  });

  it("wraps elements with provided wrapper", function() {
    const result = shallow(
      <Mount type="foo" wrapper="p" alwaysWrap={true}>
        <span>foo</span>
      </Mount>
    );

    expect(result.find("p").exists()).toBeTruthy();
  });

  it("renders registered components", function() {
    const dom = shallow(
      <Mount type="mount-test">
        <span>foo</span>
      </Mount>
    );

    expect(dom.find(FirstTestComponent).exists()).toBeTruthy();
  });

  it("replaces children with registered components", function() {
    const dom = shallow(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    expect(
      dom.containsMatchingElement(<span className="child">foo</span>)
    ).toBeFalsy();
  });

  it("updates if new component was registered", function() {
    const dom = shallow(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    MountService.registerComponent(SecondTestComponent, "mount-test");

    // This causes a re-render for enzyme to get the side effect
    dom.setProps({ nonExistant: true });

    expect(dom.find(FirstTestComponent).exists()).toBeTruthy();
    expect(dom.find(SecondTestComponent).exists()).toBeTruthy();
  });

  it("updates if new component was unregistered", function() {
    const dom = shallow(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    MountService.unregisterComponent(FirstTestComponent, "mount-test");

    // This causes a re-render for enzyme to get the side effect
    dom.setProps({ nonExistant: true });

    expect(dom.find(FirstTestComponent).exists()).toBeFalsy();
  });

  it("passes down properties", function() {
    const dom = shallow(
      <Mount type="mount-test" message="hello world">
        <span>foo</span>
      </Mount>
    );

    expect(dom.find(FirstTestComponent).prop("message")).toBe("hello world");
  });
});
