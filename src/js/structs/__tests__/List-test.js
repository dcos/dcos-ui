let Item = require('../Item');
let List = require('../List');

describe('List', function () {

  describe('#constructor', function () {

    it('defaults the list to an empty array', function () {
      let list = new List();
      expect(list.getItems()).toEqual([]);
    });

    it('accepts a list of items', function () {
      let list = new List({items: [0, 1, 2]});
      expect(list.getItems()).toEqual([0, 1, 2]);
    });

    it('throws when initialized with a non-array argument', function () {
      let fn = function () {
        return new List({items: 'foo'});
      };

      expect(fn).toThrow();
    });

  });

  describe('#add', function () {

    it('adds an item', function () {
      let list = new List();
      list.add(0);
      expect(list.getItems()).toEqual([0]);
    });

    it('adds two items', function () {
      let list = new List();
      list.add(0);
      list.add(1);
      expect(list.getItems()).toEqual([0, 1]);
    });

    it('adds items to current list', function () {
      let list = new List({items: [0]});
      list.add(1);
      list.add(2);
      expect(list.getItems()).toEqual([0, 1, 2]);
    });

  });

  describe('#getItems', function () {

    it('returns list', function () {
      let list = new List();
      expect(list.getItems()).toEqual([]);
    });

    it('returns added items in a list', function () {
      let list = new List();
      list.add(0);
      list.add(1);
      expect(list.getItems()).toEqual([0, 1]);
    });

  });

  describe('#last', function () {

    it('returns nil when there\'s no last item', function () {
      let list = new List();
      expect(list.last()).toEqual(null);
    });

    it('returns the last item in the list', function () {
      let list = new List({items: [0, 1, 2, 3]});
      expect(list.last()).toEqual(3);
    });

  });

  describe('#filterItems', function () {

    beforeEach(function () {
      var items = [
        {name: 'foo', description: {value: 'qux'}, subItems: ['one', 'two']},
        {name: 'bar', description: {value: 'quux'}, subItems: ['two', 'three']}
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

      this.instance = new List({items, filterProperties});
    });

    it('should return an instance of List', function () {
      var items = this.instance.filterItems('bar');
      expect(items instanceof List).toEqual(true);
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

      this.instance = new List({items, filterProperties});
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
      expect(filteredItems.length).toEqual(2);
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
      var list = new List({items, filterProperties});
      expect(list.filterItems.bind(list, 'foo')).not.toThrow();
    });

  });

});
