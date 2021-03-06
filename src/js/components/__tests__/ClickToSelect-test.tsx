import * as React from "react";
import { mount } from "enzyme";

import ClickToSelect from "../ClickToSelect";

let thisSpy, thisGetSelection, thisInstance;

describe("ClickToSelect", () => {
  beforeEach(() => {
    thisSpy = { selectAllChildren: jasmine.createSpy() };
    thisGetSelection = window.document.getSelection;

    // Mock this document function, which is unsupported by jest.
    window.document.getSelection = () => thisSpy;

    thisInstance = mount(
      <ClickToSelect>
        <span className="foo">hello text</span>
      </ClickToSelect>
    );
  });

  afterEach(() => {
    window.document.getSelection = thisGetSelection;
  });

  it("sets selection when node is clicked", () => {
    thisInstance.find(".foo").simulate("click");
    expect(thisSpy.selectAllChildren).toHaveBeenCalled();
  });
});
