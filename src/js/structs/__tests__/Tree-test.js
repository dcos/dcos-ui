let Item = require('../Item');
let List = require('../List');
let Tree = require('../Tree');

describe('Tree', function () {

  describe('#constructor', function () {

    it('defaults to an empty array', function () {
      let tree = new Tree();
      expect(tree.getItems()).toEqual([]);
    });

    it('accepts a list of items', function () {
      let tree = new Tree({items: [0, 1, 2]});
      expect(tree.getItems()).toEqual([0, 1, 2]);
    });

    it('accepts a nested items', function () {
      let tree = new Tree({items: [0, {items: [1.1, 1.2, 1.2]}, 2]});
      expect(tree.getItems()[1] instanceof Tree).toEqual(true);
    });

    it('throws when initialized with a non-array argument', function () {
      let fn = function () {
        return new Tree({items: 'foo'});
      };

      expect(fn).toThrow();
    });

  });

  describe('#add', function () {

    it('adds an item', function () {
      let tree = new Tree();
      tree.add(0);
      expect(tree.getItems()).toEqual([0]);
    });

    it('adds two items', function () {
      let tree = new Tree();
      tree.add(0);
      tree.add(1);
      expect(tree.getItems()).toEqual([0, 1]);
    });

    it('adds items to current Tree', function () {
      let tree = new Tree({items: [0]});
      tree.add(1);
      tree.add(2);
      expect(tree.getItems()).toEqual([0, 1, 2]);
    });

    it('adds a Tree', function () {
      let tree = new Tree();
      tree.add(new Tree());
      expect(tree.getItems()[0] instanceof Tree).toBeTruthy();
    });

  });

  describe('#getItems', function () {

    it('returns a list of items', function () {
      let tree = new Tree();
      expect(tree.getItems()).toEqual([]);
    });

    it('returns added items in a list', function () {
      let tree = new Tree();
      tree.add(0);
      tree.add(1);
      expect(tree.getItems()).toEqual([0, 1]);
    });

  });

  describe('#flattenItems', function () {

    beforeEach(function () {
      this.instance = new Tree({items: [
        {name: 'foo'}, {name: 'bar'}, {items: [{name: 'alpha'}, {name: 'beta'}]}
      ]});
    });

    it('returns an instance of List', function () {
      expect(this.instance.flattenItems() instanceof List).toBeTruthy();
    });

    it('returns correct list of items', function () {
      let items = this.instance.flattenItems().getItems();

      expect(items[0].name).toEqual('foo');
      expect(items[1].name).toEqual('bar');
      expect(items[2] instanceof Tree).toBeTruthy();
      expect(items[3].name).toEqual('alpha');
      expect(items[4].name).toEqual('beta');
    });

  });

  describe('#filterItems', function () {

    beforeEach(function () {
      var items = [
        {name: 'foo', description: {value: 'qux'}, tags: ['one', 'two']},
        {name: 'bar', description: {value: 'quux'}, tags: ['two', 'three']},
        {
          items: [
            {
              name: 'alpha',
              description: {value: 'gamma'},
              tags: ['one', 'two']
            },
            {
              name: 'beta',
              description: {value: 'delta'},
              tags: ['one', 'two']
            }
          ]
        }
      ];
      var filterProperties = {
        name: null,
        description: function (item, prop) {
          return item[prop] && item[prop].value;
        },
        tags: function (item, prop) {
          return item[prop] && item[prop].join(' ');
        }
      };

      this.instance = new Tree({items, filterProperties});
    });

    it('should return an instance of Tree', function () {
      let filteredTree = this.instance.filterItems('bar');
      expect(filteredTree instanceof Tree).toEqual(true);
    });

    it('should filter sub trees', function () {
      let filteredSubtree = this.instance.filterItems('alpha').getItems()[0];
      expect(filteredSubtree instanceof Tree).toEqual(true);
      expect(filteredSubtree.getItems()[0].name).toEqual('alpha');
    });

    it('should filter instances of Item', function () {
      var items = [
        new Item({
          name: 'foo',
          description: {value: 'qux'},
          tags: ['one', 'two']
        }),
        new Item({
          name: 'bar',
          description: {value: 'quux'},
          tags: ['two', 'three']}
        )
      ];
      var filterProperties = {
        name: null,
        description: function (item, prop) {
          return item[prop] && item[prop].value;
        },
        tags: function (item, prop) {
          return item[prop] && item[prop].join(' ');
        }
      };

      this.instance = new Tree({items, filterProperties});
      var filteredItems = this.instance.filterItems('bar').getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0] instanceof Item).toEqual(true);
    });

    it('should filter by default getter', function () {
      var filteredItems = this.instance.filterItems('bar').getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].name).toEqual('bar');
    });

    it('should filter by description', function () {
      var filteredItems = this.instance.filterItems('qux').getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].description.value).toEqual('qux');
    });

    it('should filter by tags', function () {
      var filteredItems = this.instance.filterItems('two').getItems();
      expect(filteredItems.length).toEqual(3);
      expect(filteredItems[0].tags).toEqual(['one', 'two']);
      expect(filteredItems[1].tags).toEqual(['two', 'three']);
    });

    it('should handle filter by with null elements', function () {
      var items = [
        {name: null, description: {value: null}, tags: [null, 'three']},
        {description: null, tags: null}
      ];
      var filterProperties = {
        name: null,
        description: function (item, prop) {
          return item[prop] && item[prop].value;
        },
        tags: function (item, prop) {
          return item[prop] && item[prop].join(' ');
        }
      };
      var list = new Tree({items, filterProperties});
      expect(list.filterItems.bind(list, 'foo')).not.toThrow();
    });

  });

  describe('#findItem', function () {

    beforeEach(function () {
      this.instance = new Tree({items: [
        {name: 'foo'}, {name: 'bar'}, {items: [{name: 'alpha'}, {name: 'beta'}]}
      ]});
    });

    it('should return undefined if no matching item was found', function () {
      expect(this.instance.findItem(function () {
        return false;
      })).toEqual(undefined);
    });

    it('should return matching item', function () {
      expect(this.instance.findItem(function (item) {
        return item.name === 'beta';
      })).toEqual({name: 'beta'});
    });

  });

});
