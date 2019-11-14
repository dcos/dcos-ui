import React from "react";

import { shallow } from "enzyme";

const Mount = require("../Mount");
const { MountService } = require("../index");

describe("Mount", () => {
  const FirstTestComponent = props => (
    <div className="component">{props.message}</div>
  );

  const SecondTestComponent = props => (
    <div className="component">{props.message}</div>
  );

  beforeEach(() => {
    MountService.registerComponent(FirstTestComponent, "mount-test");
  });

  afterEach(() => {
    MountService.unregisterComponent(FirstTestComponent, "mount-test");
    MountService.unregisterComponent(SecondTestComponent, "mount-test");
  });

  it("renders one by default", () => {
    const result = shallow(
      <Mount type="children-test">
        <span>foo</span>
      </Mount>
    );

    expect(result.containsAllMatchingElements([<span>foo</span>])).toBeTruthy();
  });

  it("renders multiple children by default", () => {
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

  it("renders null if no component is registered and no children defined", () => {
    const result = shallow(<Mount type="children-test" />);

    expect(result.children().exists()).toBeFalsy();
  });

  it("doesnt wrap a single child", () => {
    const result = shallow(
      <Mount type="foo">
        <span>foo</span>
      </Mount>
    );

    expect(result.type()).toBe("span");
  });

  it("always wraps elements if configured", () => {
    const result = shallow(
      <Mount type="foo" alwaysWrap>
        <span>foo</span>
      </Mount>
    );

    expect(result.type()).toBe("div");
  });

  it("wraps elements with provided wrapper", () => {
    const result = shallow(
      <Mount type="foo" wrapper="p" alwaysWrap={true}>
        <span>foo</span>
      </Mount>
    );

    expect(result.find("p").exists()).toBeTruthy();
  });

  it("renders registered components", () => {
    const dom = shallow(
      <Mount type="mount-test">
        <span>foo</span>
      </Mount>
    );

    expect(dom.find(FirstTestComponent).exists()).toBeTruthy();
  });

  it("replaces children with registered components", () => {
    const dom = shallow(
      <Mount type="mount-test">
        <span className="child">foo</span>
      </Mount>
    );

    expect(
      dom.containsMatchingElement(<span className="child">foo</span>)
    ).toBeFalsy();
  });

  it("updates if new component was registered", () => {
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

  it("updates if new component was unregistered", () => {
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

  it("passes down properties", () => {
    const dom = shallow(
      <Mount type="mount-test" message="hello world">
        <span>foo</span>
      </Mount>
    );

    expect(dom.find(FirstTestComponent).prop("message")).toBe("hello world");
  });
});
