import { shallow } from "enzyme";

import TabsMixin from "../TabsMixin";

let thisInstance;

describe("TabsMixin", () => {
  beforeEach(() => {
    TabsMixin.tabs_tabs = { foo: "bar", baz: "qux", corge: "Grault" };
  });

  describe("#tabs_getUnroutedItem", () => {
    beforeEach(() => {
      thisInstance = shallow(
        TabsMixin.tabs_getUnroutedItem({ classNames: "hux" }, "baz")
      );
    });

    it("returns an element", () => {
      expect(thisInstance.exists());
    });

    it("returns an element containing a span", () => {
      expect(thisInstance.type()).toEqual("span");
    });

    it("adds custom props to span", () => {
      expect(
        TabsMixin.tabs_getUnroutedItem({ other: true }, "baz").props.other
      ).toEqual(true);
    });

    it("removes existing className", () => {
      expect(
        TabsMixin.tabs_getUnroutedItem(
          { classNames: { "menu-tabbed-item-label": false } },
          "baz"
        ).props.className
      ).toEqual("");
    });

    it("adds custom class to span", () => {
      expect(thisInstance.prop("className")).toEqual(
        "menu-tabbed-item-label hux"
      );
    });
  });

  describe("#tabs_getUnroutedTabs", () => {
    beforeEach(() => {
      TabsMixin.state = { currentTab: "baz" };
    });

    it("calls tabs_getUnroutedItem with appropriate arguments", () => {
      spyOn(TabsMixin, "tabs_getUnroutedItem");
      TabsMixin.tabs_getUnroutedTabs({ classNames: "quix" });

      expect(TabsMixin.tabs_getUnroutedItem.calls.allArgs()).toEqual([
        [{ classNames: "quix" }, "foo", 0],
        [{ classNames: "quix" }, "baz", 1],
        [{ classNames: "quix" }, "corge", 2]
      ]);
    });
  });

  describe("#tabs_getTabView", () => {
    beforeEach(() => {
      TabsMixin.state = { currentTab: "corge" };
      TabsMixin.renderGraultTabView = () => "test";
    });

    it("does not call render function before called", () => {
      spyOn(TabsMixin, "renderGraultTabView");
      expect(TabsMixin.renderGraultTabView).not.toHaveBeenCalled();
    });

    it("calls appropriate render function when called", () => {
      spyOn(TabsMixin, "renderGraultTabView");
      TabsMixin.tabs_getTabView();
      expect(TabsMixin.renderGraultTabView).toHaveBeenCalled();
    });

    it("calls appropriate render function when called", () => {
      spyOn(TabsMixin, "renderGraultTabView");
      TabsMixin.tabs_getTabView("foo", "bar");
      expect(TabsMixin.renderGraultTabView).toHaveBeenCalledWith("foo", "bar");
    });

    it("removes spaces and call render function", () => {
      TabsMixin.tabs_tabs = { qux: "Quux Garply" };
      TabsMixin.state = { currentTab: "qux" };
      TabsMixin.renderQuuxGarplyTabView = () => "test";
      spyOn(TabsMixin, "renderQuuxGarplyTabView");
      TabsMixin.tabs_getTabView();
      expect(TabsMixin.renderQuuxGarplyTabView).toHaveBeenCalled();
    });

    it("returns result of function when called", () => {
      const result = TabsMixin.tabs_getTabView();
      expect(result).toEqual("test");
    });

    it("nulls if it doesn't exist", () => {
      TabsMixin.renderGraultTabView = undefined;
      const result = TabsMixin.tabs_getTabView();
      expect(result).toEqual(null);
    });

    it("does not call render function if it doesn't exist", () => {
      TabsMixin.renderGraultTabView = undefined;
      const fn = TabsMixin.tabs_getTabView.bind(TabsMixin);
      expect(fn).not.toThrow();
    });
  });
});
