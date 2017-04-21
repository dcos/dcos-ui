jest.dontMock("../TabsMixin");
jest.dontMock("../../utils/TabsUtil");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const Link = require("react-router").Link;
const TestUtils = require("react-addons-test-utils");

const TabsMixin = require("../TabsMixin");
const TabsUtil = require("../../utils/TabsUtil");

describe("TabsMixin", function() {
  beforeEach(function() {
    TabsMixin.tabs_tabs = { foo: "bar", baz: "qux", corge: "Grault" };
  });

  describe("#tabs_getRoutedItem", function() {
    beforeEach(function() {
      this.instance = TabsMixin.tabs_getRoutedItem(
        { classNames: "foo" },
        "baz"
      );
    });

    it("should return an element", function() {
      expect(TestUtils.isElement(this.instance)).toEqual(true);
    });

    it("should return an element containing a link", function() {
      expect(TestUtils.isElementOfType(this.instance, Link)).toEqual(true);
    });

    it("should add custom props to span", function() {
      expect(
        TabsMixin.tabs_getRoutedItem({ other: true }, "foo").props.other
      ).toEqual(true);
    });

    it("should remove existing className", function() {
      expect(
        TabsMixin.tabs_getUnroutedItem(
          { classNames: { "menu-tabbed-item-label": false } },
          "foo"
        ).props.className
      ).toEqual("");
    });

    it("should add custom class to link", function() {
      expect(this.instance.props.className).toEqual(
        "menu-tabbed-item-label foo"
      );
    });
  });

  describe("#tabs_getUnroutedItem", function() {
    beforeEach(function() {
      this.instance = TabsMixin.tabs_getUnroutedItem(
        { classNames: "hux" },
        "baz"
      );
    });

    it("should return an element", function() {
      expect(TestUtils.isElement(this.instance)).toEqual(true);
    });

    it("should return an element containing a span", function() {
      expect(this.instance.type).toEqual("span");
    });

    it("should add custom props to span", function() {
      expect(
        TabsMixin.tabs_getUnroutedItem({ other: true }, "baz").props.other
      ).toEqual(true);
    });

    it("should remove existing className", function() {
      expect(
        TabsMixin.tabs_getUnroutedItem(
          { classNames: { "menu-tabbed-item-label": false } },
          "baz"
        ).props.className
      ).toEqual("");
    });

    it("should add custom class to span", function() {
      expect(this.instance.props.className).toEqual(
        "menu-tabbed-item-label hux"
      );
    });
  });

  describe("#tabs_getUnroutedTabs", function() {
    beforeEach(function() {
      TabsMixin.state = { currentTab: "baz" };
    });

    it("should call getTabs with appropriate arguments", function() {
      spyOn(TabsUtil, "getTabs");
      TabsMixin.tabs_getUnroutedTabs(null);

      expect(TabsUtil.getTabs.calls.mostRecent().args[0]).toEqual({
        foo: "bar",
        baz: "qux",
        corge: "Grault"
      });
      expect(TabsUtil.getTabs.calls.mostRecent().args[1]).toEqual("baz");
    });

    it("should call tabs_getUnroutedItem with appropriate arguments", function() {
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

    it("should call getTabs with appropriate arguments", function() {
      spyOn(TabsUtil, "getTabs");
      TabsMixin.tabs_getRoutedTabs(null);

      expect(TabsUtil.getTabs.calls.mostRecent().args[0]).toEqual({
        foo: "bar",
        baz: "qux",
        corge: "Grault"
      });
      expect(TabsUtil.getTabs.calls.mostRecent().args[1]).toEqual("foo");
    });

    it("should call tabs_getRoutedItem with appropriate arguments", function() {
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

    it("should not call render function before called", function() {
      spyOn(TabsMixin, "renderGraultTabView");
      expect(TabsMixin.renderGraultTabView).not.toHaveBeenCalled();
    });

    it("should call appropriate render function when called", function() {
      spyOn(TabsMixin, "renderGraultTabView");
      TabsMixin.tabs_getTabView();
      expect(TabsMixin.renderGraultTabView).toHaveBeenCalled();
    });

    it("should call appropriate render function when called", function() {
      spyOn(TabsMixin, "renderGraultTabView");
      TabsMixin.tabs_getTabView("foo", "bar");
      expect(TabsMixin.renderGraultTabView).toHaveBeenCalledWith("foo", "bar");
    });

    it("should remove spaces and call render function", function() {
      TabsMixin.tabs_tabs = { qux: "Quux Garply" };
      TabsMixin.state = { currentTab: "qux" };
      TabsMixin.renderQuuxGarplyTabView = function() {
        return "test";
      };
      spyOn(TabsMixin, "renderQuuxGarplyTabView");
      TabsMixin.tabs_getTabView();
      expect(TabsMixin.renderQuuxGarplyTabView).toHaveBeenCalled();
    });

    it("should return result of function when called", function() {
      var result = TabsMixin.tabs_getTabView();
      expect(result).toEqual("test");
    });

    it("should null if it doesn't exist", function() {
      TabsMixin.renderGraultTabView = undefined;
      var result = TabsMixin.tabs_getTabView();
      expect(result).toEqual(null);
    });

    it("should not call render function if it doesn't exist", function() {
      TabsMixin.renderGraultTabView = undefined;
      var fn = TabsMixin.tabs_getTabView.bind(TabsMixin);
      expect(fn).not.toThrow();
    });
  });
});
