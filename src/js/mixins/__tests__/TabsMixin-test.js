/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Link } from "react-router";
import { shallow } from "enzyme";

const TabsMixin = require("../TabsMixin");
const TabsUtil = require("../../utils/TabsUtil");

let thisInstance;

describe("TabsMixin", function() {
  beforeEach(function() {
    TabsMixin.tabs_tabs = { foo: "bar", baz: "qux", corge: "Grault" };
  });

  describe("#tabs_getRoutedItem", function() {
    beforeEach(function() {
      thisInstance = shallow(
        TabsMixin.tabs_getRoutedItem({ classNames: "foo" }, "baz")
      );
    });

    it("returns an element", function() {
      expect(thisInstance.exists());
    });

    it("returns an element containing a link", function() {
      expect(thisInstance.find(Link).exists());
    });

    it("adds custom props to span", function() {
      expect(
        TabsMixin.tabs_getRoutedItem({ other: true }, "foo").props.other
      ).toEqual(true);
    });

    it("removes existing className", function() {
      expect(
        TabsMixin.tabs_getUnroutedItem(
          { classNames: { "menu-tabbed-item-label": false } },
          "foo"
        ).props.className
      ).toEqual("");
    });

    it("adds custom class to link", function() {
      expect(thisInstance.prop("className")).toEqual(
        "menu-tabbed-item-label foo"
      );
    });
  });

  describe("#tabs_getUnroutedItem", function() {
    beforeEach(function() {
      thisInstance = shallow(
        TabsMixin.tabs_getUnroutedItem({ classNames: "hux" }, "baz")
      );
    });

    it("returns an element", function() {
      expect(thisInstance.exists());
    });

    it("returns an element containing a span", function() {
      expect(thisInstance.type()).toEqual("span");
    });

    it("adds custom props to span", function() {
      expect(
        TabsMixin.tabs_getUnroutedItem({ other: true }, "baz").props.other
      ).toEqual(true);
    });

    it("removes existing className", function() {
      expect(
        TabsMixin.tabs_getUnroutedItem(
          { classNames: { "menu-tabbed-item-label": false } },
          "baz"
        ).props.className
      ).toEqual("");
    });

    it("adds custom class to span", function() {
      expect(thisInstance.prop("className")).toEqual(
        "menu-tabbed-item-label hux"
      );
    });
  });

  describe("#tabs_getUnroutedTabs", function() {
    beforeEach(function() {
      TabsMixin.state = { currentTab: "baz" };
    });

    it("calls getTabs with appropriate arguments", function() {
      spyOn(TabsUtil, "getTabs");
      TabsMixin.tabs_getUnroutedTabs(null);

      expect(TabsUtil.getTabs.calls.mostRecent().args[0]).toEqual({
        foo: "bar",
        baz: "qux",
        corge: "Grault"
      });
      expect(TabsUtil.getTabs.calls.mostRecent().args[1]).toEqual("baz");
    });

    it("calls tabs_getUnroutedItem with appropriate arguments", function() {
      spyOn(TabsMixin, "tabs_getUnroutedItem");
      TabsMixin.tabs_getUnroutedTabs({ classNames: "quix" });

      expect(TabsMixin.tabs_getUnroutedItem.calls.allArgs()).toEqual([
        [{ classNames: "quix" }, "foo", 0],
        [{ classNames: "quix" }, "baz", 1],
        [{ classNames: "quix" }, "corge", 2]
      ]);
    });
  });

  describe("#tabs_getRoutedTabs", function() {
    beforeEach(function() {
      TabsMixin.state = { currentTab: "foo" };
    });

    it("calls getTabs with appropriate arguments", function() {
      spyOn(TabsUtil, "getTabs");
      TabsMixin.tabs_getRoutedTabs(null);

      expect(TabsUtil.getTabs.calls.mostRecent().args[0]).toEqual({
        foo: "bar",
        baz: "qux",
        corge: "Grault"
      });
      expect(TabsUtil.getTabs.calls.mostRecent().args[1]).toEqual("foo");
    });

    it("calls tabs_getRoutedItem with appropriate arguments", function() {
      spyOn(TabsMixin, "tabs_getRoutedItem");
      TabsMixin.tabs_getRoutedTabs({ classNames: "quilt" });

      expect(TabsMixin.tabs_getRoutedItem.calls.allArgs()).toEqual([
        [{ classNames: "quilt" }, "foo", 0],
        [{ classNames: "quilt" }, "baz", 1],
        [{ classNames: "quilt" }, "corge", 2]
      ]);
    });
  });

  describe("#tabs_getTabView", function() {
    beforeEach(function() {
      TabsMixin.state = { currentTab: "corge" };
      TabsMixin.renderGraultTabView = function() {
        return "test";
      };
    });

    it("does not call render function before called", function() {
      spyOn(TabsMixin, "renderGraultTabView");
      expect(TabsMixin.renderGraultTabView).not.toHaveBeenCalled();
    });

    it("calls appropriate render function when called", function() {
      spyOn(TabsMixin, "renderGraultTabView");
      TabsMixin.tabs_getTabView();
      expect(TabsMixin.renderGraultTabView).toHaveBeenCalled();
    });

    it("calls appropriate render function when called", function() {
      spyOn(TabsMixin, "renderGraultTabView");
      TabsMixin.tabs_getTabView("foo", "bar");
      expect(TabsMixin.renderGraultTabView).toHaveBeenCalledWith("foo", "bar");
    });

    it("removes spaces and call render function", function() {
      TabsMixin.tabs_tabs = { qux: "Quux Garply" };
      TabsMixin.state = { currentTab: "qux" };
      TabsMixin.renderQuuxGarplyTabView = function() {
        return "test";
      };
      spyOn(TabsMixin, "renderQuuxGarplyTabView");
      TabsMixin.tabs_getTabView();
      expect(TabsMixin.renderQuuxGarplyTabView).toHaveBeenCalled();
    });

    it("returns result of function when called", function() {
      var result = TabsMixin.tabs_getTabView();
      expect(result).toEqual("test");
    });

    it("nulls if it doesn't exist", function() {
      TabsMixin.renderGraultTabView = undefined;
      var result = TabsMixin.tabs_getTabView();
      expect(result).toEqual(null);
    });

    it("does not call render function if it doesn't exist", function() {
      TabsMixin.renderGraultTabView = undefined;
      var fn = TabsMixin.tabs_getTabView.bind(TabsMixin);
      expect(fn).not.toThrow();
    });
  });
});
