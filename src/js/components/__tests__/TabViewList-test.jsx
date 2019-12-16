import React from "react";
import { mount } from "enzyme";

import TabView from "../TabView";
import TabViewList from "../TabViewList";

let thisInstance;

describe("TabViewList", () => {
  it("returns content of first child if no activeTab is defined", () => {
    thisInstance = mount(
      <TabViewList>
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViewList>
    );

    expect(thisInstance.text()).toEqual("foo");
  });

  it("returns content of activeTab when defined", () => {
    thisInstance = mount(
      <TabViewList activeTab="bar">
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViewList>
    );

    expect(thisInstance.text()).toEqual("bar");
  });
});
