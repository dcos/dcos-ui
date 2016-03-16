let GroupTree = require('../GroupTree');
let Service = require('../Service');

describe('GroupTree', function () {

  var groupsTestData = {
    id: '/group/id',
    apps: [{id: 'alpha'}, {id: 'beta'}],
    groups: [{id: '/test', apps: [{id: 'foo'}, {id: 'bar'}], groups: []}]
  };

  describe('#constructor', function () {

    it('defaults id to default root group id ("/")', function () {
      let group = new GroupTree({apps: [], groups: []});
      expect(group.getId()).toEqual('/');
    });

    it('accepts id', function () {
      let group = new GroupTree(groupsTestData);
      expect(group.getId()).toEqual('/group/id');
    });

    it('accepts nested groups', function () {
      let group = new GroupTree(groupsTestData);
      expect(group.getItems()[0] instanceof GroupTree).toEqual(true);
    });

    it('throws when initialized without apps or groups arguments', function () {
      let fn = function () {
        return new GroupTree({id: '/group/id'});
      };

      expect(fn).toThrow();
    });

  });

  describe('#add', function () {

    it('adds a service', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      group.add(new Service({id: 'a'}));
      expect(group.getItems()[0].get('id')).toEqual('a');
    });

    it('adds service like items', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      group.add({id: 'a'});
      expect(group.getItems()[0].id).toEqual('a');
    });

    it('adds two items', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      group.add(new Service({id: 'a'}));
      group.add(new Service({id: 'b'}));
      expect(group.getItems()[0].get('id')).toEqual('a');
      expect(group.getItems()[1].get('id')).toEqual('b');
    });

    it('adds items to current Group', function () {
      let group = new GroupTree({
        id: '/test',
        apps: [new Service({id: 'a'})],
        groups: []
      });
      group.add(new Service({id: 'b'}));
      group.add(new Service({id: 'c'}));

      expect(group.getItems()[0].get('id')).toEqual('a');
      expect(group.getItems()[1].get('id')).toEqual('b');
      expect(group.getItems()[2].get('id')).toEqual('c');
    });

  });

  describe('#getItems', function () {

    it('returns a list of items', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      expect(group.getItems()).toEqual([]);
    });

    it('returns added items in a list', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      group.add(new Service({id: 'a'}));
      group.add(new Service({id: 'b'}));
      expect(group.getItems()[0].get('id')).toEqual('a');
      expect(group.getItems()[1].get('id')).toEqual('b');
    });

  });

  describe('#last', function () {

    it('returns nil when there\'s no last item', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      expect(group.last()).toEqual(null);
    });

    it('returns the last item in the list', function () {
      let group = new GroupTree({id: '/test', apps: [], groups: []});
      group.add(new Service({id: 'a'}));
      group.add(new Service({id: 'b'}));
      expect(group.last().get('id')).toEqual('b');
    });

  });

  xdescribe('#filterItems', function () {

    beforeEach(function () {

      this.instance = new GroupTree({
        id: '/group/id',
        apps: [{id: 'alpha'}, {id: 'beta'}],
        groups: [{id: '/test', apps: [{id: 'foo'}, {id: 'bar'}], groups: []}],
        filterProperties: {
          id: null
        }
      });
    });

    it('should return an instance of GroupTree', function () {
      let filteredGroup = this.instance.filterItems('alpha');

      console.log("filteredGroup", filteredGroup);

      expect(filteredGroup instanceof GroupTree).toBeTruthy();
    });

    it('should filter sub groups', function () {
      let filteredSubgroup = this.instance.filterItems('bar').getItems()[0];
      expect(filteredSubgroup instanceof GroupTree).toBeTruthy();
      expect(filteredSubgroup.getItems()[0].name).toEqual('bar');
    });

  });

});
