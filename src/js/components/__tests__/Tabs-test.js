import React from "react";
import { mount } from "enzyme";

const TabButton = require("../TabButton");
const TabButtonList = require("../TabButtonList");
const Tabs = require("../Tabs");
const TabView = require("../TabView");
const TabViewList = require("../TabViewList");

let thisHandleTabChange, thisInstance;

describe("Tabs", function() {
  beforeEach(function() {
    thisHandleTabChange = jest.fn();
    thisInstance = mount(
      <Tabs
        vertical={true}
        handleTabChange={thisHandleTabChange}
        activeTab="foo"
      >
        <TabButtonList>
          <TabButton id="foo" label="Foo">
            <TabButton id="bar" label="Bar" />
            <TabButton id="baz" label="Baz">
              <TabButton id="qux" label="Qux" />
            </TabButton>
          </TabButton>
        </TabButtonList>
        <TabViewList>
          <TabView id="foo">Foo</TabView>
          <TabView id="bar">Bar</TabView>
          <TabView id="baz">Baz</TabView>
          <TabView id="qux">Qux</TabView>
        </TabViewList>
      </Tabs>
    );
  });

  it("calls handleTabChange function", function() {
    const tabButtons = thisInstance.find(".menu-tabbed-item");

    tabButtons
      .at(1)
      .find(".menu-tabbed-item-label")
      .simulate("click");
    expect(thisHandleTabChange.mock.calls[0]).toEqual(["bar"]);
  });

  it("updates to the correct active tab", function() {
    expect(
      thisInstance
        .find(".menu-tabbed-item.active > .menu-tabbed-item-label")
        .text()
    ).toEqual("Foo");

    thisInstance.setProps({
      activeTab: "qux"
    });

    expect(
      thisInstance
        .find(".menu-tabbed-item.active > .menu-tabbed-item-label")
        .text()
    ).toEqual("Qux");
  });

  it("passes the activeTab prop to its children", function() {
    thisInstance
      .find(".menu-tabbed-item-label")
      .filterWhere(n => n.text() === "Foo")
      .simulate("click");

    expect(
      thisInstance
        .find(TabViewList)
        .first()
        .prop("activeTab")
    ).toEqual("foo");
    expect(
      thisInstance
        .find(TabButtonList)
        .first()
        .prop("activeTab")
    ).toEqual("foo");
  });

  it("passes the change handler to TabButtonList", function() {
    expect(
      thisInstance
        .find(TabButtonList)
        .first()
        .prop("onChange")
    ).toEqual(thisHandleTabChange);
  });

  it("passes the vertical prop to TabButtonList", function() {
    expect(
      thisInstance
        .find(TabButtonList)
        .first()
        .prop("vertical")
    ).toEqual(true);
  });
});
