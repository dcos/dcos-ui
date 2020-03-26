import Item from "../Item";
import List from "../List";

let thisThing, thisThingList, thisInstance;

describe("List", () => {
  beforeEach(() => {
    thisThing = class Thing {
      constructor(value) {
        if (value instanceof Thing) {
          throw Error("Tried to re-instantiate a ThingList item");
        }
      }
    };
    thisThingList = class ThingList extends List {};
    thisThingList.type = thisThing;
  });

  describe("#constructor", () => {
    it("defaults the list to an empty array", () => {
      const list = new List();
      expect(list.getItems()).toEqual([]);
    });

    it("accepts a list of items", () => {
      const list = new List({ items: [0, 1, 2] });
      expect(list.getItems()).toEqual([0, 1, 2]);
    });

    it("throws when initialized with a non-array argument", () => {
      const fn = () => new List({ items: "foo" });

      expect(fn).toThrow();
    });

    it("enforces type, if specified", () => {
      const thingList = new thisThingList({ items: [{}] });
      expect(thingList.last()).toEqual(jasmine.any(thisThing));
    });

    it("does not re-cast items of the correct type", () => {
      // If re-cast, an error will be thrown
      new thisThingList({ items: [new thisThing({})] });
    });
  });

  describe("#combine", () => {
    it("discards duplicate items", () => {
      const [A, B, C, D, E] = [{}, {}, {}, {}, {}];
      const list1 = new List({ items: [A, B, C] });
      const list2 = new List({ items: [E, C, A, D] });
      const list3 = list1.combine(list2);
      expect(list3.getItems()).toEqual([A, B, C, E, D]);
    });

    it("can operate on the same objects more than one time", () => {
      const [A, B, C, D, E, F, G] = [{}, {}, {}, {}, {}, {}, {}];
      const list1 = new List({ items: [A, B, C] });
      const list2 = new List({ items: [E, C, A, D] });
      const list3 = new List({ items: [A, D, F, G] });

      const list4 = list1.combine(list2);
      const list5 = list4.combine(list3);

      expect(list4.getItems()).toEqual([A, B, C, E, D]);
      expect(list5.getItems()).toEqual([A, B, C, E, D, F, G]);
    });
  });

  describe("#add", () => {
    it("adds an item", () => {
      const list = new List();
      list.add(0);
      expect(list.getItems()).toEqual([0]);
    });

    it("adds two items", () => {
      const list = new List();
      list.add(0);
      list.add(1);
      expect(list.getItems()).toEqual([0, 1]);
    });

    it("adds items to current list", () => {
      const list = new List({ items: [0] });
      list.add(1);
      list.add(2);
      expect(list.getItems()).toEqual([0, 1, 2]);
    });

    it("enforces type, if specified", () => {
      const thingList = new thisThingList();
      thingList.add({});
      expect(thingList.last()).toEqual(jasmine.any(thisThing));
    });

    it("does not re-cast items of the correct type", () => {
      const thingList = new thisThingList();
      // If re-cast, an error will be thrown
      thingList.add(new thisThing());
    });
  });

  describe("#getItems", () => {
    it("returns list", () => {
      const list = new List();
      expect(list.getItems()).toEqual([]);
    });

    it("returns added items in a list", () => {
      const list = new List();
      list.add(0);
      list.add(1);
      expect(list.getItems()).toEqual([0, 1]);
    });
  });

  describe("#last", () => {
    it("returns nil when there's no last item", () => {
      const list = new List();
      expect(list.last()).toEqual(undefined);
    });

    it("returns the last item in the list", () => {
      const list = new List({ items: [0, 1, 2, 3] });
      expect(list.last()).toEqual(3);
    });
  });

  describe("#filterItems", () => {
    beforeEach(() => {
      const items = [
        { name: "foo" },
        { name: "bar" },
        { name: "qux" },
        { name: "quux" },
      ];

      thisInstance = new List({ items });
    });

    it("returns an instance of List", () => {
      const items = thisInstance.filterItems(() => true);
      expect(items instanceof List).toEqual(true);
    });

    it("filters items", () => {
      const items = thisInstance.filterItems((item) => item.name === "bar");
      expect(items.getItems().length).toEqual(1);
      expect(items.getItems()[0]).toEqual({ name: "bar" });
    });
  });

  describe("#filterItemsByText", () => {
    beforeEach(() => {
      const items = [
        {
          name: "foo",
          description: { value: "qux", label: "corge" },
          subItems: ["one", "two"],
        },
        {
          name: "bar",
          description: { value: "quux", label: "grault" },
          subItems: ["two", "three"],
        },
      ];
      const filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        subItems(item, prop) {
          return item[prop] && item[prop].join(" ");
        },
      };

      thisInstance = new List({ items, filterProperties });
    });

    it("returns an instance of List", () => {
      const items = thisInstance.filterItemsByText("bar");
      expect(items instanceof List).toEqual(true);
    });

    it("filters instances of Item", () => {
      const items = [
        new Item({
          name: "foo",
          description: { value: "qux" },
          subItems: ["one", "two"],
        }),
        new Item({
          name: "bar",
          description: { value: "quux" },
          subItems: ["two", "three"],
        }),
      ];
      const filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        subItems(item, prop) {
          return item[prop] && item[prop].join(" ");
        },
      };

      thisInstance = new List({ items, filterProperties });
      const filteredItems = thisInstance.filterItemsByText("bar").getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0] instanceof Item).toEqual(true);
    });

    it("filters by default getter", () => {
      const filteredItems = thisInstance.filterItemsByText("bar").getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].name).toEqual("bar");
    });

    it("filters by description", () => {
      const filteredItems = thisInstance.filterItemsByText("qux").getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].description.value).toEqual("qux");
    });

    it("filters by subItems", () => {
      const filteredItems = thisInstance.filterItemsByText("two").getItems();
      expect(filteredItems.length).toEqual(2);
      expect(filteredItems[0].subItems).toEqual(["two", "three"]);
      expect(filteredItems[1].subItems).toEqual(["one", "two"]);
    });

    it("handles filter by with null elements", () => {
      const items = [
        { name: null, description: { value: null }, subItems: [null, "three"] },
        { description: null, subItems: null },
      ];
      const filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        subItems(item, prop) {
          return item[prop] && item[prop].join(" ");
        },
      };
      const list = new List({ items, filterProperties });
      expect(list.filterItemsByText.bind(list, "foo")).not.toThrow();
    });

    it("uses provided filter properties", () => {
      const filterProperties = {
        description(item, prop) {
          return item[prop] && item[prop].label;
        },
      };
      const filteredItems = thisInstance
        .filterItemsByText("corge", filterProperties)
        .getItems();
      expect(filteredItems[0].name).toEqual("foo");
    });
  });

  describe("#findItem", () => {
    beforeEach(() => {
      thisInstance = new List({ items: [{ name: "foo" }, { name: "bar" }] });
    });

    it("returns undefined if no matching item was found", () => {
      expect(thisInstance.findItem(() => false)).toEqual(undefined);
    });

    it("returns matching item", () => {
      expect(thisInstance.findItem((item) => item.name === "foo")).toEqual({
        name: "foo",
      });
    });
  });

  describe("#mapItems", () => {
    beforeEach(() => {
      thisInstance = new List({ items: [{ name: "foo" }, { name: "bar" }] });
    });

    it("returns an instance of List", () => {
      const list = thisInstance.mapItems((item) => item);
      expect(list instanceof List).toEqual(true);
    });

    it("apply callbacks to all items", () => {
      const items = thisInstance
        .mapItems((item) => ({
          name: item.name.toUpperCase(),
        }))
        .getItems();
      expect(items[0].name).toEqual("FOO");
      expect(items[1].name).toEqual("BAR");
    });
  });

  describe("#reduceItems", () => {
    beforeEach(() => {
      thisInstance = new List({ items: [{ name: "foo" }, { name: "bar" }] });
    });

    it("reduces all items to a value", () => {
      const expectedValue = thisInstance.reduceItems(
        (previousValue, currentValue) => previousValue + currentValue.name,
        ""
      );

      expect(expectedValue).toEqual("foobar");
    });
  });
});
