import Item from "../Item";
import List from "../List";
import Tree from "../Tree";

let thisInstance;

describe("Tree", () => {
  describe("#constructor", () => {
    it("defaults to an empty array", () => {
      const tree = new Tree();
      expect(tree.getItems()).toEqual([]);
    });

    it("accepts a list of items", () => {
      const tree = new Tree({ items: [0, 1, 2] });
      expect(tree.getItems()).toEqual([0, 1, 2]);
    });

    it("accepts a nested items", () => {
      const tree = new Tree({ items: [0, { items: [1.1, 1.2, 1.2] }, 2] });
      expect(tree.getItems()[1] instanceof Tree).toEqual(true);
    });

    it("throws when initialized with a non-array argument", () => {
      const fn = () => new Tree({ items: "foo" });

      expect(fn).toThrow();
    });
  });

  describe("#add", () => {
    it("adds an item", () => {
      const tree = new Tree();
      tree.add(0);
      expect(tree.getItems()).toEqual([0]);
    });

    it("adds two items", () => {
      const tree = new Tree();
      tree.add(0);
      tree.add(1);
      expect(tree.getItems()).toEqual([0, 1]);
    });

    it("adds items to current Tree", () => {
      const tree = new Tree({ items: [0] });
      tree.add(1);
      tree.add(2);
      expect(tree.getItems()).toEqual([0, 1, 2]);
    });

    it("adds a Tree", () => {
      const tree = new Tree();
      tree.add(new Tree());
      expect(tree.getItems()[0] instanceof Tree).toBeTruthy();
    });
  });

  describe("#getItems", () => {
    it("returns a list of items", () => {
      const tree = new Tree();
      expect(tree.getItems()).toEqual([]);
    });

    it("returns added items in a list", () => {
      const tree = new Tree();
      tree.add(0);
      tree.add(1);
      expect(tree.getItems()).toEqual([0, 1]);
    });
  });

  describe("#flattenItems", () => {
    beforeEach(() => {
      thisInstance = new Tree({
        items: [
          { name: "foo" },
          { name: "bar" },
          { items: [{ name: "alpha" }, { name: "beta" }] }
        ]
      });
    });

    it("returns an instance of List", () => {
      expect(thisInstance.flattenItems() instanceof List).toBeTruthy();
    });

    it("returns correct list of items", () => {
      const items = thisInstance.flattenItems().getItems();

      expect(items[0].name).toEqual("foo");
      expect(items[1].name).toEqual("bar");
      expect(items[2] instanceof Tree).toBeTruthy();
      expect(items[3].name).toEqual("alpha");
      expect(items[4].name).toEqual("beta");
    });
  });

  describe("#filterItems", () => {
    beforeEach(() => {
      const items = [
        { name: "foo" },
        { name: "bar" },
        {
          items: [
            {
              name: "alpha"
            },
            {
              name: "beta"
            },
            {
              items: [
                {
                  name: "one"
                },
                {
                  name: "two"
                }
              ]
            }
          ]
        }
      ];

      thisInstance = new Tree({ items });
    });

    it("returns an instance of Tree", () => {
      const filteredTree = thisInstance.filterItems(() => true);
      expect(filteredTree instanceof Tree).toEqual(true);
    });

    it("filters items", () => {
      const filteredTree = thisInstance.filterItems(
        item => item.name === "bar"
      );

      expect(filteredTree.getItems().length).toEqual(1);
      expect(filteredTree.getItems()[0]).toEqual({ name: "bar" });
    });

    it("filters sub items", () => {
      const filteredTree = thisInstance.filterItems(
        item => item.name === "one"
      );

      expect(
        filteredTree
          .getItems()[0]
          .getItems()[0]
          .getItems()[0]
      ).toEqual({
        name: "one"
      });
    });
  });

  describe("#filterItemsByText", () => {
    beforeEach(() => {
      const items = [
        {
          name: "foo",
          description: { value: "qux", label: "corge" },
          tags: ["one", "two"]
        },
        {
          name: "bar",
          description: { value: "quux", label: "grault" },
          tags: ["two", "three"]
        },
        {
          items: [
            {
              name: "alpha",
              description: { value: "gamma", label: "epsilon" },
              tags: ["one", "two"]
            },
            {
              name: "beta",
              description: { value: "delta", label: "zeta" },
              tags: ["one", "two"]
            }
          ]
        }
      ];
      const filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        tags(item, prop) {
          return item[prop] && item[prop].join(" ");
        }
      };

      thisInstance = new Tree({ items, filterProperties });
    });

    it("returns an instance of Tree", () => {
      const filteredTree = thisInstance.filterItemsByText("bar");
      expect(filteredTree instanceof Tree).toEqual(true);
    });

    it("filters sub trees", () => {
      const filteredSubtree = thisInstance
        .filterItemsByText("alpha")
        .getItems()[0];
      expect(filteredSubtree instanceof Tree).toEqual(true);
      expect(filteredSubtree.getItems()[0].name).toEqual("alpha");
    });

    it("filters instances of Item", () => {
      const items = [
        new Item({
          name: "foo",
          description: { value: "qux" },
          tags: ["one", "two"]
        }),
        new Item({
          name: "bar",
          description: { value: "quux" },
          tags: ["two", "three"]
        })
      ];
      const filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        tags(item, prop) {
          return item[prop] && item[prop].join(" ");
        }
      };

      thisInstance = new Tree({ items, filterProperties });
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

    it("filters by tags", () => {
      const filteredItems = thisInstance.filterItemsByText("two").getItems();
      expect(filteredItems.length).toEqual(3);
      expect(filteredItems[0].tags).toEqual(["one", "two"]);
      expect(filteredItems[1].tags).toEqual(["two", "three"]);
    });

    it("handles filter by with null elements", () => {
      const items = [
        { name: null, description: { value: null }, tags: [null, "three"] },
        { description: null, tags: null }
      ];
      const filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        tags(item, prop) {
          return item[prop] && item[prop].join(" ");
        }
      };
      const list = new Tree({ items, filterProperties });
      expect(list.filterItemsByText.bind(list, "foo")).not.toThrow();
    });

    it("uses provided filter properties", () => {
      const filterProperties = {
        description(item, prop) {
          return item[prop] && item[prop].label;
        }
      };
      const filteredItems = thisInstance
        .filterItemsByText("zeta", filterProperties)
        .getItems();
      expect(filteredItems[0].getItems()[0].name).toEqual("beta");
    });
  });

  describe("#findItem", () => {
    beforeEach(() => {
      thisInstance = new Tree({
        items: [
          { name: "foo" },
          { name: "bar" },
          { items: [{ name: "alpha" }, { name: "beta" }] }
        ]
      });
    });

    it("returns undefined if no matching item was found", () => {
      expect(thisInstance.findItem(() => false)).toEqual(undefined);
    });

    it("returns matching item", () => {
      expect(thisInstance.findItem(item => item.name === "beta")).toEqual({
        name: "beta"
      });
    });
  });

  describe("#mapItems", () => {
    beforeEach(() => {
      thisInstance = new Tree({
        items: [
          { name: "foo" },
          { name: "bar" },
          { items: [{ name: "alpha" }, { name: "beta" }] }
        ]
      });
    });

    it("returns an instance of Tree", () => {
      const tree = thisInstance.mapItems(item => item);
      expect(tree instanceof Tree).toBeTruthy();
    });

    it("apply callbacks to all items", () => {
      const items = thisInstance
        .mapItems(item => {
          if (item instanceof Tree) {
            return item;
          }

          return { name: item.name.toUpperCase() };
        })
        .flattenItems()
        .getItems();

      expect(items[0].name).toEqual("FOO");
      expect(items[1].name).toEqual("BAR");
      expect(items[2] instanceof Tree).toBeTruthy();
      expect(items[3].name).toEqual("ALPHA");
      expect(items[4].name).toEqual("BETA");
    });
  });

  describe("#reduceItems", () => {
    beforeEach(() => {
      thisInstance = new Tree({
        items: [
          {
            name: "foo",
            value: 7
          },
          {
            name: "bar",
            value: 13
          },
          {
            items: [
              {
                name: "alpha",
                value: 5
              },
              {
                name: "beta",
                value: 3
              },
              {
                items: [
                  {
                    name: "one",
                    value: 2
                  },
                  {
                    name: "two",
                    value: 1
                  }
                ]
              }
            ]
          },
          {
            name: "qux",
            value: 11
          }
        ]
      });
    });

    it("reduces tree to a single number", () => {
      const value = thisInstance.reduceItems((previousValue, currentValue) => {
        if (currentValue instanceof Tree) {
          return previousValue;
        }

        return previousValue + currentValue.value;
      }, 0);

      expect(value).toEqual(42);
    });

    it("reduces tree to an array", () => {
      const value = thisInstance.reduceItems((previousValue, currentValue) => {
        if (currentValue instanceof Tree) {
          previousValue.push(currentValue.getItems().length);

          return previousValue;
        }
        previousValue.push(currentValue.name);

        return previousValue;
      }, []);

      expect(value).toEqual([
        "foo",
        "bar",
        3,
        "alpha",
        "beta",
        2,
        "one",
        "two",
        "qux"
      ]);
    });
  });
});
