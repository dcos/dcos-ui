import React from "react";
import { shallow, mount } from "enzyme";

const TabButton = require("../TabButton");

let thisClickHandler, thisInstance;

describe("TabButton", function() {
  beforeEach(function() {
    thisClickHandler = jasmine.createSpy("click handler");
  });

  it("calls the onClick prop with ID when clicked", function() {
    thisInstance = mount(
      <TabButton label="foo" onClick={thisClickHandler} id="foo" />
    );

    // Click the TabButton's label
    thisInstance.find(".menu-tabbed-item-label").simulate("click");

    expect(thisClickHandler).toHaveBeenCalledWith("foo");
  });

  it("clones nested TabButton instances with onClick and activeTab props", function() {
    thisInstance = shallow(
      <TabButton
        activeTab="foo"
        label="foo"
        onClick={thisClickHandler}
        id="foo"
      >
        <TabButton label="bar" id="bar" />
      </TabButton>
    );

    const nestedInstance = thisInstance.find(TabButton).first();

    expect(nestedInstance.prop("activeTab")).toEqual("foo");
    expect(nestedInstance.prop("onClick")).toEqual(thisClickHandler);
  });

  it("calls the parent onClick when clicking a nested TabButton", function() {
    thisInstance = mount(
      <TabButton
        activeTab="foo"
        label="foo"
        onClick={thisClickHandler}
        id="foo"
      >
        <TabButton label="bar" id="bar" />
      </TabButton>
    );

    // Click the TabButton's label
    thisInstance
      .find(".menu-tabbed-item .menu-tabbed-item .menu-tabbed-item-label")
      .at(1)
      .simulate("click");

    expect(thisClickHandler).toHaveBeenCalledWith("bar");
  });
});
