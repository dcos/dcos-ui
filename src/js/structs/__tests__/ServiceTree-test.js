let Application = require('../Application');
let ServiceTree = require('../ServiceTree');
let Framework = require('../Framework');

describe('ServiceTree', function () {

  beforeEach(function () {
    this.instance = new ServiceTree({
      id: '/group/id',
      apps: [
        {id: 'alpha', cmd: 'cmd'},
        {id: 'beta', cmd: 'cmd', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}},
        {id: 'gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
      ],
      groups: [
        {id: '/test', apps: [
          {id: 'foo', cmd: 'cmd'},
          {id: 'bar', cmd: 'cmd'}
        ], groups: []}
      ],
      filterProperties: {
        id: function (item) {
          return item.getId();
        }
      }
    });
  });

  describe('#constructor', function () {

    it('defaults id to root tree (groups) id', function () {
      let tree = new ServiceTree({apps: [], groups: []});
      expect(tree.getId()).toEqual('/');
    });

    it('sets correct tree (groups) id', function () {
      expect(this.instance.getId()).toEqual('/group/id');
    });

    it('accepts nested trees (groups)', function () {
      expect(this.instance.getItems()[0] instanceof ServiceTree).toEqual(true);
    });

    it('converts items into Application and Framework instances', function () {
      expect(this.instance.getItems()[1] instanceof Application).toEqual(true);
      expect(this.instance.getItems()[2] instanceof Framework).toEqual(true);
      expect(this.instance.getItems()[3] instanceof Application).toEqual(true);
    });

  });

  describe('#add', function () {

    it('adds a service', function () {
      let tree = new ServiceTree({id: '/test', apps: [], groups: []});
      tree.add(new Application({id: 'a'}));
      expect(tree.getItems()[0].get('id')).toEqual('a');
    });

    it('adds service like items', function () {
      let tree = new ServiceTree({id: '/test', apps: [], groups: []});
      tree.add({id: 'a'});
      expect(tree.getItems()[0].id).toEqual('a');
    });

    it('adds two items', function () {
      let tree = new ServiceTree({id: '/test', apps: [], groups: []});
      tree.add(new Application({id: 'a'}));
      tree.add(new Application({id: 'b'}));
      expect(tree.getItems()[0].get('id')).toEqual('a');
      expect(tree.getItems()[1].get('id')).toEqual('b');
    });

    it('adds items to current Tree', function () {
      let tree = new ServiceTree({
        id: '/test',
        apps: [new Application({id: 'a'})],
        groups: []
      });
      tree.add(new Application({id: 'b'}));
      tree.add(new Application({id: 'c'}));

      expect(tree.getItems()[0].get('id')).toEqual('a');
      expect(tree.getItems()[1].get('id')).toEqual('b');
      expect(tree.getItems()[2].get('id')).toEqual('c');
    });

  });

  describe('#filterItems', function () {

    it('should return an instance of ServiceTree', function () {
      let filteredTree = this.instance.filterItems('alpha');
      expect(filteredTree instanceof ServiceTree).toBeTruthy();
    });

    it('should include matching trees', function () {
      let filteredItems = this.instance.filterItems('test').getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });

    it('should not include empty trees', function () {
      let filteredItems = this.instance.filterItems('beta').getItems();
      expect(filteredItems[0] instanceof Framework).toBeTruthy();
    });

    it('should no include matching subtrees', function () {
      let filteredItems = this.instance.filterItems('foo').getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });
  });

  describe('#findItem', function () {

    it('should find matching subtree', function () {
      expect(this.instance.findItem(function (item) {
        return item.getId() === '/test';
      }).getId()).toEqual('/test');
    });

  });

});
