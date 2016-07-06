let Item = require('../Item');
let List = require('../List');

describe('List', function () {

  beforeEach(function () {
    this.Thing = class Thing {
      constructor(value) {
        if (value instanceof Thing) {
          throw Error('Tried to re-instantiate a ThingList item');
        }
      }
    };
    this.ThingList = class ThingList extends List {};
    this.ThingList.type = this.Thing;
  });

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

    it('enforces type, if specified', function () {
      let {Thing, ThingList} = this;
      let thingList = new ThingList({items: [{}]});
      expect(thingList.last()).toEqual(jasmine.any(Thing));
    });

    it('does not re-cast items of the correct type', function () {
      let {Thing, ThingList} = this;
      // If re-cast, an error will be thrown
      new ThingList({items: [new Thing({})]});
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

    it('enforces type, if specified', function () {
      let {Thing, ThingList} = this;
      let thingList = new ThingList();
      thingList.add({});
      expect(thingList.last()).toEqual(jasmine.any(Thing));
    });

    it('does not re-cast items of the correct type', function () {
      let {Thing, ThingList} = this;
      let thingList = new ThingList();
      // If re-cast, an error will be thrown
      thingList.add(new Thing());
    });

  });

  describe('#concatItems', function () {

    beforeEach(function () {
      this.list = new List({items: [1, 2]});
    });

    it('returns an instance of List', function () {
      expect(this.list.concatItems()).toEqual(jasmine.any(List));
    });

    it('concatenate list items', function () {
      let items = this.list.concatItems(new List({items: [3, 4]})).getItems();

      expect(items).toEqual([1, 2, 3, 4]);
    });

    it('concatenate list items', function () {
      let items = this.list.concatItems(new List({items: [3, 4]}), 5, {v: 6})
        .getItems();

      expect(items).toEqual([1, 2, 3, 4, 5, {v: 6}]);
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
      expect(list.last()).toEqual(undefined);
    });

    it('returns the last item in the list', function () {
      let list = new List({items: [0, 1, 2, 3]});
      expect(list.last()).toEqual(3);
    });

  });

  describe('#filterItems', function () {

    beforeEach(function () {
      var items = [
        {name: 'foo'},
        {name: 'bar'},
        {name: 'qux'},
        {name: 'quux'}
      ];

      this.instance = new List({items});
    });

    it('should return an instance of List', function () {
      var items = this.instance.filterItems(function () {
        return true;
      });
      expect(items instanceof List).toEqual(true);
    });

    it('should filter items', function () {
      var items = this.instance.filterItems(function (item) {
        return item.name === 'bar';
      });
      expect(items.getItems().length).toEqual(1);
      expect(items.getItems()[0]).toEqual({name: 'bar'});
    });

  });

  describe('#filterItemsByText', function () {

    beforeEach(function () {
      var items = [
        {
          name: 'foo',
          description: {value: 'qux', label: 'corge'},
          subItems: ['one', 'two']
        },
        {
          name: 'bar',
          description: {value: 'quux', label: 'grault'},
          subItems: ['two', 'three']
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

      this.instance = new List({items, filterProperties});
    });

    it('should return an instance of List', function () {
      var items = this.instance.filterItemsByText('bar');
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
          subItems: ['two', 'three']
        })
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
      var filteredItems = this.instance.filterItemsByText('bar').getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0] instanceof Item).toEqual(true);
    });

    it('should filter by default getter', function () {
      var filteredItems = this.instance.filterItemsByText('bar').getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].name).toEqual('bar');
    });

    it('should filter by description', function () {
      var filteredItems = this.instance.filterItemsByText('qux').getItems();
      expect(filteredItems.length).toEqual(1);
      expect(filteredItems[0].description.value).toEqual('qux');
    });

    it('should filter by subItems', function () {
      var filteredItems = this.instance.filterItemsByText('two').getItems();
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
      expect(list.filterItemsByText.bind(list, 'foo')).not.toThrow();
    });

    it('should use provided filter properties', function () {
      var filterProperties = {
        description: function (item, prop) {
          return item[prop] && item[prop].label;
        }
      };
      var filteredItems = this.instance
        .filterItemsByText('corge', filterProperties)
        .getItems();
      expect(filteredItems[0].name).toEqual('foo');
    });

  });

  describe('#findItem', function () {

    beforeEach(function () {
      this.instance = new List({items: [{name: 'foo'}, {name: 'bar'}]});
    });

    it('should return undefined if no matching item was found', function () {
      expect(this.instance.findItem(function () {
        return false;
      })).toEqual(undefined);
    });

    it('should return matching item', function () {
      expect(this.instance.findItem(function (item) {
        return item.name === 'foo';
      })).toEqual({name: 'foo'});
    });

  });

  describe('#mapItems', function () {

    beforeEach(function () {
      this.instance = new List({items: [{name: 'foo'}, {name: 'bar'}]});
    });

    it('should return an instance of List', function () {
      var list = this.instance.mapItems(function (item) {
        return item;
      });
      expect(list instanceof List).toEqual(true);
    });

    it('should apply callback to all items', function () {
      var items = this.instance.mapItems(function (item) {
        return {name: item.name.toUpperCase()};
      }).getItems();
      expect(items[0].name).toEqual('FOO');
      expect(items[1].name).toEqual('BAR');
    });

  });

  describe('#reduceItems', function () {

    beforeEach(function () {
      this.instance = new List({items: [{name: 'foo'}, {name: 'bar'}]});
    });

    it('should reduce all items to a value', function () {
      var expectedValue = this.instance.reduceItems(
        function (previousValue, currentValue) {
          return previousValue + currentValue.name;
        }, '');
      expect(expectedValue).toEqual('foobar');
    });

  });

});
