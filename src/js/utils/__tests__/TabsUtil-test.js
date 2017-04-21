jest.dontMock("../TabsUtil");

const TabsUtil = require("../TabsUtil");

describe("TabsUtil", function() {
  describe("#getTabs", function() {
    beforeEach(function() {
      this.tabs = { foo: "bar", baz: "qux", corge: "grault" };
      this.hierarchicalTabs = { foo: "bar", foobar: "foobar", "-foo": "baz" };
      this.getElement = function() {};
      spyOn(this, "getElement");
    });

    it("should return an empty array when given an empty object", function() {
      var result = TabsUtil.getTabs({}, null, this.getElement);

      expect(this.getElement).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return equal length array to what is given", function() {
      var result = TabsUtil.getTabs(this.tabs, "baz", this.getElement);

      expect(this.getElement.calls.count()).toEqual(3);
      expect(result.length).toEqual(3);
    });

    it("should return LIs", function() {
      var result = TabsUtil.getTabs(this.tabs, "baz", this.getElement);

      expect(result[0].type).toEqual("li");
      expect(result[1].type).toEqual("li");
      expect(result[2].type).toEqual("li");
    });

    it("should return elements with one active class", function() {
      var result = TabsUtil.getTabs(this.tabs, "baz", this.getElement);

      expect(result[0].props.className).toEqual("menu-tabbed-item");
      expect(result[1].props.className).toEqual("menu-tabbed-item active");
      expect(result[2].props.className).toEqual("menu-tabbed-item");
    });

    it("should not highlight routes contained within the class name", function() {
      var tabs = TabsUtil.getTabs(
        this.hierarchicalTabs,
        "-foo",
        this.getElement
      );

      expect(tabs[0].props.className).toEqual("menu-tabbed-item");
      expect(tabs[1].props.className).toEqual("menu-tabbed-item");
      expect(tabs[2].props.className).toEqual("menu-tabbed-item active");
    });

    it("should highlight all routes which prefix the current tab name", function() {
      var tabs = TabsUtil.getTabs(
        this.hierarchicalTabs,
        "foobar",
        this.getElement
      );

      expect(tabs[0].props.className).toEqual("menu-tabbed-item active");
      expect(tabs[1].props.className).toEqual("menu-tabbed-item active");
      expect(tabs[2].props.className).toEqual("menu-tabbed-item");
    });

    it("should call getElement with appropriate arguments", function() {
      TabsUtil.getTabs(this.tabs, "baz", this.getElement);

      expect(this.getElement.calls.allArgs()).toEqual([
        ["foo", 0],
        ["baz", 1],
        ["corge", 2]
      ]);
    });

    it("should throw an error when tabs is null", function() {
      var fn = TabsUtil.getTabs.bind(null, null, "baz", function() {});

      expect(fn).toThrow();
    });

    it("should throw an error when tabs is undefined", function() {
      var fn = TabsUtil.getTabs.bind(null, undefined, "baz", function() {});

      expect(fn).toThrow();
    });

    it("should not have an active route when it doesn't exist", function() {
      TabsUtil.getTabs(this.tabs, "notHere", this.getElement);

      expect(this.getElement.calls.allArgs()).toEqual([
        ["foo", 0],
        ["baz", 1],
        ["corge", 2]
      ]);
    });
  });

  describe("#sortTabs", function() {
    beforeEach(function() {
      this.tabs = {
        foo: {
          content: "foo",
          priority: 20
        },
        bar: {
          content: "bar",
          priority: 30
        },
        qux: {
          content: "qux",
          priority: 10
        }
      };
    });

    it("should arrange tabs in correct order", function() {
      var sortedTabs = TabsUtil.sortTabs(this.tabs);
      var tabContent = Object.keys(sortedTabs);
      expect(tabContent).toEqual(["bar", "foo", "qux"]);
    });
  });
});
