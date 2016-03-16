let Item = require('../Item');
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

  describe('#last', function () {

    it('returns nil when there\'s no last item', function () {
      let tree = new Tree();
      expect(tree.last()).toEqual(null);
    });

    it('returns the last item in the list', function () {
      let tree = new Tree({items: [0, 1, 2, 3]});
      expect(tree.last()).toEqual(3);
    });

  });

  describe('#filterItems', function () {

    beforeEach(function () {
      var items = [
        {name: 'foo', description: {value: 'qux'}, subItems: ['one', 'two']},
        {name: 'bar', description: {value: 'quux'}, subItems: ['two', 'three']},
        {
          items: [
            {
              name: 'alpha',
              description: {value: 'gamma'},
              subItems: ['one', 'two']
            },
            {
              name: 'beta',
              description: {value: 'delta'},
              subItems: ['one', 'two']
            }
          ]
        }
      ];
      var filterProperties = {
        name: null,
        description: function (item, prop) {
          return item[prop] && item[prop].value;
        },
        subItems: function (item, prop) {
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
          subItems: ['one', 'two']
        }),
        new Item({
          name: 'bar',
          description: {value: 'quux'},
          subItems: ['two', 'three']}
        )
      ];
      var filterProperties = {
        name: null,
        description: function (item, prop) {
          return item[prop] && item[prop].value;
        },
        subItems: function (item, prop) {
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

    it('should filter by subItems', function () {
      var filteredItems = this.instance.filterItems('two').getItems();
      expect(filteredItems.length).toEqual(3);
      expect(filteredItems[0].subItems).toEqual(['one', 'two']);
      expect(filteredItems[1].subItems).toEqual(['two', 'three']);
    });

    it('should handle filter by with null elements', function () {
      var items = [
        {name: null, description: {value: null}, subItems: [null, 'three']},
        {description: null, subItems: null}
      ];
      var filterProperties = {
        name: null,
        description: function (item, prop) {
          return item[prop] && item[prop].value;
        },
        subItems: function (item, prop) {
          return item[prop] && item[prop].join(' ');
        }
      };
      var list = new Tree({items, filterProperties});
      expect(list.filterItems.bind(list, 'foo')).not.toThrow();
    });

  });

});
