import React from "react";
import { mount } from "enzyme";

const TabView = require("../TabView");
const TabViewList = require("../TabViewList");

let thisInstance;

describe("TabViewList", function() {
  it("returns content of first child if no activeTab is defined", function() {
    thisInstance = mount(
      <TabViewList>
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViewList>
    );

    expect(thisInstance.text()).toEqual("foo");
  });

  it("returns content of activeTab when defined", function() {
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
