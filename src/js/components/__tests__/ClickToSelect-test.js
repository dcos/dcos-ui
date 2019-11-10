import React from "react";
import { mount } from "enzyme";

const ClickToSelect = require("../ClickToSelect");

let thisSpy, thisGetSelection, thisInstance;

describe("ClickToSelect", () => {
  beforeEach(() => {
    thisSpy = { selectAllChildren: jasmine.createSpy() };
    thisGetSelection = global.document.getSelection;

    // Mock this document function, which is unsupported by jest.
    global.document.getSelection = () => thisSpy;

    thisInstance = mount(
      <ClickToSelect>
        <span className="foo">hello text</span>
      </ClickToSelect>
    );
  });

  afterEach(() => {
    global.document.getSelection = thisGetSelection;
  });

  it("sets selection when node is clicked", () => {
    thisInstance.find(".foo").simulate("click");
    expect(thisSpy.selectAllChildren).toHaveBeenCalled();
  });
});
