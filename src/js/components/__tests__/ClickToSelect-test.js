import React from "react";
import { mount } from "enzyme";

const ClickToSelect = require("../ClickToSelect");

let thisSpy, thisGetSelection, thisInstance;

describe("ClickToSelect", function() {
  beforeEach(function() {
    thisSpy = { selectAllChildren: jasmine.createSpy() };
    thisGetSelection = global.document.getSelection;

    // Mock this document function, which is unsupported by jest.
    global.document.getSelection = function() {
      return thisSpy;
    };

    thisInstance = mount(
      <ClickToSelect>
        <span className="foo">hello text</span>
      </ClickToSelect>
    );
  });

  afterEach(function() {
    global.document.getSelection = thisGetSelection;
  });

  it("sets selection when node is clicked", function() {
    thisInstance.find(".foo").simulate("click");
    expect(thisSpy.selectAllChildren).toHaveBeenCalled();
  });
});
