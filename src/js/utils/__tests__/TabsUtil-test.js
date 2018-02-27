const TabsUtil = require("../TabsUtil");

let thisTabs, thisHierarchicalTabs, thisGetElement;

describe("TabsUtil", function() {
  describe("#getTabs", function() {
    beforeEach(function() {
      thisTabs = { foo: "bar", baz: "qux", corge: "grault" };
      thisHierarchicalTabs = { foo: "bar", foobar: "foobar", "-foo": "baz" };
      thisGetElement = jest.fn();
    });

    it("returns an empty array when given an empty object", function() {
      var result = TabsUtil.getTabs({}, null, thisGetElement);

      expect(thisGetElement).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("returns equal length array to what is given", function() {
      var result = TabsUtil.getTabs(thisTabs, "baz", thisGetElement);

      expect(thisGetElement.mock.calls.length).toEqual(3);
      expect(result.length).toEqual(3);
    });

    it("returns LIs", function() {
      var result = TabsUtil.getTabs(thisTabs, "baz", thisGetElement);

      expect(result[0].type).toEqual("li");
      expect(result[1].type).toEqual("li");
      expect(result[2].type).toEqual("li");
    });

    it("returns elements with one active class", function() {
      var result = TabsUtil.getTabs(thisTabs, "baz", thisGetElement);

      expect(result[0].props.className).toEqual("menu-tabbed-item");
      expect(result[1].props.className).toEqual("menu-tabbed-item active");
      expect(result[2].props.className).toEqual("menu-tabbed-item");
    });

    it("does not highlight routes contained within the class name", function() {
      var tabs = TabsUtil.getTabs(thisHierarchicalTabs, "-foo", thisGetElement);

      expect(tabs[0].props.className).toEqual("menu-tabbed-item");
      expect(tabs[1].props.className).toEqual("menu-tabbed-item");
      expect(tabs[2].props.className).toEqual("menu-tabbed-item active");
    });

    it("highlights all routes which prefix the current tab name", function() {
      var tabs = TabsUtil.getTabs(
        thisHierarchicalTabs,
        "foobar",
        thisGetElement
      );

      expect(tabs[0].props.className).toEqual("menu-tabbed-item active");
      expect(tabs[1].props.className).toEqual("menu-tabbed-item active");
      expect(tabs[2].props.className).toEqual("menu-tabbed-item");
    });

    it("calls getElement with appropriate arguments", function() {
      TabsUtil.getTabs(thisTabs, "baz", thisGetElement);

      expect(thisGetElement.mock.calls).toEqual([
        ["foo", 0],
        ["baz", 1],
        ["corge", 2]
      ]);
    });

    it("throws an error when tabs is null", function() {
      var fn = TabsUtil.getTabs.bind(null, null, "baz", function() {});

      expect(fn).toThrow();
    });

    it("throws an error when tabs is undefined", function() {
      var fn = TabsUtil.getTabs.bind(null, undefined, "baz", function() {});

      expect(fn).toThrow();
    });

    it("does not have an active route when it doesn't exist", function() {
      TabsUtil.getTabs(thisTabs, "notHere", thisGetElement);

      expect(thisGetElement.mock.calls).toEqual([
        ["foo", 0],
        ["baz", 1],
        ["corge", 2]
      ]);
    });
  });

  describe("#sortTabs", function() {
    beforeEach(function() {
      thisTabs = {
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

    it("arranges tabs in correct order", function() {
      var sortedTabs = TabsUtil.sortTabs(thisTabs);
      var tabContent = Object.keys(sortedTabs);
      expect(tabContent).toEqual(["bar", "foo", "qux"]);
    });
  });
});
