const Item = require("../Item");
const List = require("../List");
const Tree = require("../Tree");

let thisInstance;

describe("Tree", function() {
  describe("#constructor", function() {
    it("defaults to an empty array", function() {
      const tree = new Tree();
      expect(tree.getItems()).toEqual([]);
    });

    it("accepts a list of items", function() {
      const tree = new Tree({ items: [0, 1, 2] });
      expect(tree.getItems()).toEqual([0, 1, 2]);
    });

    it("accepts a nested items", function() {
      const tree = new Tree({ items: [0, { items: [1.1, 1.2, 1.2] }, 2] });
      expect(tree.getItems()[1] instanceof Tree).toEqual(true);
    });

    it("throws when initialized with a non-array argument", function() {
      const fn = function() {
        return new Tree({ items: "foo" });
      };

      expect(fn).toThrow();
    });
  });

  describe("#add", function() {
    it("adds an item", function() {
      const tree = new Tree();
      tree.add(0);
      expect(tree.getItems()).toEqual([0]);
    });

    it("adds two items", function() {
      const tree = new Tree();
      tree.add(0);
      tree.add(1);
      expect(tree.getItems()).toEqual([0, 1]);
    });

    it("adds items to current Tree", function() {
      const tree = new Tree({ items: [0] });
      tree.add(1);
      tree.add(2);
      expect(tree.getItems()).toEqual([0, 1, 2]);
    });

    it("adds a Tree", function() {
      const tree = new Tree();
      tree.add(new Tree());
      expect(tree.getItems()[0] instanceof Tree).toBeTruthy();
    });
  });

  describe("#getItems", function() {
    it("returns a list of items", function() {
      const tree = new Tree();
      expect(tree.getItems()).toEqual([]);
    });

    it("returns added items in a list", function() {
      const tree = new Tree();
      tree.add(0);
      tree.add(1);
      expect(tree.getItems()).toEqual([0, 1]);
    });
  });

  describe("#flattenItems", function() {
    beforeEach(function() {
      thisInstance = new Tree({
        items: [
          { name: "foo" },
          { name: "bar" },
          { items: [{ name: "alpha" }, { name: "beta" }] }
        ]
      });
    });

    it("returns an instance of List", function() {
      expect(thisInstance.flattenItems() instanceof List).toBeTruthy();
    });

    it("returns correct list of items", function() {
      const items = thisInstance.flattenItems().getItems();

      expect(items[0].name).toEqual("foo");
      expect(items[1].name).toEqual("bar");
      expect(items[2] instanceof Tree).toBeTruthy();
      expect(items[3].name).toEqual("alpha");
      expect(items[4].name).toEqual("beta");
    });
  });

  describe("#filterItems", function() {
    beforeEach(function() {
      var items = [
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

    it("returns an instance of Tree", function() {
      var filteredTree = thisInstance.filterItems(function() {
        return true;
      });
      expect(filteredTree instanceof Tree).toEqual(true);
    });

    it("filters items", function() {
      var filteredTree = thisInstance.filterItems(function(item) {
        return item.name === "bar";
      });

      expect(filteredTree.getItems().length).toEqual(1);
      expect(filteredTree.getItems()[0]).toEqual({ name: "bar" });
    });

    it("filters sub items", function() {
      var filteredTree = thisInstance.filterItems(function(item) {
        return item.name === "one";
      });

      expect(filteredTree.getItems()[0].getItems()[0].getItems()[0]).toEqual({
        name: "one"
      });
    });
  });

  describe("#filterItemsByText", function() {
    beforeEach(function() {
      var items = [
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
      var filterProperties = {
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

    it("returns an instance of Tree", function() {
      const filteredTree = thisInstance.filterItemsByText("bar");
      expect(filteredTree instanceof Tree).toEqual(true);
    });

    it("filters sub trees", function() {
      const filteredSubtree = thisInstance
        .filterItemsByText("alpha")
        .getItems()[0];
      expect(filteredSubtree instanceof Tree).toEqual(true);
      expect(filteredSubtree.getItems()[0].name).toEqual("alpha");
    });

    it("filters instances of Item", function() {
      var items = [
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
      var filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        tags(item, prop) {
          return item[prop] && item[prop].join(" ");
        }
      };

      thisInstance = new Tree({ items, filterProperties });
      var filteredItems = thisInstance.filterItemsByText("bar").getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0] instanceof Item).toEqual(true);
    });

    it("filters by default getter", function() {
      var filteredItems = thisInstance.filterItemsByText("bar").getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].name).toEqual("bar");
    });

    it("filters by description", function() {
      var filteredItems = thisInstance.filterItemsByText("qux").getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].description.value).toEqual("qux");
    });

    it("filters by tags", function() {
      var filteredItems = thisInstance.filterItemsByText("two").getItems();
      expect(filteredItems.length).toEqual(3);
      expect(filteredItems[0].tags).toEqual(["one", "two"]);
      expect(filteredItems[1].tags).toEqual(["two", "three"]);
    });

    it("handles filter by with null elements", function() {
      var items = [
        { name: null, description: { value: null }, tags: [null, "three"] },
        { description: null, tags: null }
      ];
      var filterProperties = {
        name: null,
        description(item, prop) {
          return item[prop] && item[prop].value;
        },
        tags(item, prop) {
          return item[prop] && item[prop].join(" ");
        }
      };
      var list = new Tree({ items, filterProperties });
      expect(list.filterItemsByText.bind(list, "foo")).not.toThrow();
    });

    it("uses provided filter properties", function() {
      var filterProperties = {
        description(item, prop) {
          return item[prop] && item[prop].label;
        }
      };
      var filteredItems = thisInstance
        .filterItemsByText("zeta", filterProperties)
        .getItems();
      expect(filteredItems[0].getItems()[0].name).toEqual("beta");
    });
  });

  describe("#findItem", function() {
    beforeEach(function() {
      thisInstance = new Tree({
        items: [
          { name: "foo" },
          { name: "bar" },
          { items: [{ name: "alpha" }, { name: "beta" }] }
        ]
      });
    });

    it("returns undefined if no matching item was found", function() {
      expect(
        thisInstance.findItem(function() {
          return false;
        })
      ).toEqual(undefined);
    });

    it("returns matching item", function() {
      expect(
        thisInstance.findItem(function(item) {
          return item.name === "beta";
        })
      ).toEqual({ name: "beta" });
    });
  });

  describe("#mapItems", function() {
    beforeEach(function() {
      thisInstance = new Tree({
        items: [
          { name: "foo" },
          { name: "bar" },
          { items: [{ name: "alpha" }, { name: "beta" }] }
        ]
      });
    });

    it("returns an instance of Tree", function() {
      var tree = thisInstance.mapItems(function(item) {
        return item;
      });
      expect(tree instanceof Tree).toBeTruthy();
    });

    it("apply callbacks to all items", function() {
      var items = thisInstance
        .mapItems(function(item) {
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

  describe("#reduceItems", function() {
    beforeEach(function() {
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

    it("reduces tree to a single number", function() {
      var value = thisInstance.reduceItems(function(
        previousValue,
        currentValue
      ) {
        if (currentValue instanceof Tree) {
          return previousValue;
        }

        return previousValue + currentValue.value;
      }, 0);

      expect(value).toEqual(42);
    });

    it("reduces tree to an array", function() {
      var value = thisInstance.reduceItems(function(
        previousValue,
        currentValue
      ) {
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
