let Application = require('../Application');
let Framework = require('../Framework');
let HealthStatus = require('../../constants/HealthStatus');
let Service = require('../Service');
let ServiceTree = require('../ServiceTree');

describe('ServiceTree', function () {

  describe('#constructor', function () {

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group/id',
        apps: [
          {id: 'alpha', cmd: 'cmd'},
          {
            id: 'beta',
            cmd: 'cmd',
            labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          },
          {id: 'gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
        ],
        groups: [
          {
            id: '/test', apps: [
            {id: 'foo', cmd: 'cmd'},
            {id: 'bar', cmd: 'cmd'}
          ], groups: []
          }
        ],
        filterProperties: {
          id: function (item) {
            return item.getId();
          }
        }
      });
    });

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

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group/id',
        apps: [
          {id: 'alpha', cmd: 'cmd'},
          {
            id: 'beta',
            cmd: 'cmd',
            labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          },
          {id: 'gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
        ],
        groups: [
          {
            id: '/test', apps: [
            {id: 'foo', cmd: 'cmd'},
            {id: 'bar', cmd: 'cmd'}
          ], groups: []
          }
        ],
        filterProperties: {
          id: function (item) {
            return item.getId();
          }
        }
      });
    });

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

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group/id',
        apps: [
          {id: 'alpha', cmd: 'cmd'},
          {
            id: 'beta',
            cmd: 'cmd',
            labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          },
          {id: 'gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
        ],
        groups: [
          {
            id: '/test', apps: [
            {id: 'foo', cmd: 'cmd'},
            {id: 'bar', cmd: 'cmd'}
          ], groups: []
          }
        ],
        filterProperties: {
          id: function (item) {
            return item.getId();
          }
        }
      });
    });

    it('should find matching subtree', function () {
      expect(this.instance.findItem(function (item) {
        return item.getId() === '/test';
      }).getId()).toEqual('/test');
    });

  });

  describe('#getHealth', function () {

    const healthyService = new Service({
      healthChecks: [{path: '', protocol: 'HTTP'}],
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 1,
      tasksUnhealthy: 0
    });
    const unhealthyService = new Service({
      healthChecks: [{path: '', protocol: 'HTTP'}],
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 0,
      tasksUnhealthy: 1
    });
    const idleService = new Service({
      healthChecks: [{path: '', protocol: 'HTTP'}],
      tasksStaged: 0,
      tasksRunning: 0,
      tasksHealthy: 0,
      tasksUnhealthy: 0
    });
    const naService = new Service({
      healthChecks: [],
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 0,
      tasksUnhealthy: 0
    });

    beforeEach(function () {
      this.instance = new ServiceTree();

    });

    it('returns NA health for empty tree', function () {
      expect(this.instance.getHealth()).toEqual(HealthStatus.NA);
    });

    it('returns correct health for a tree with healthy services', function () {
      this.instance.add(healthyService);

      expect(this.instance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it('returns correct health for a tree with healthy and idle services',
      function () {
        this.instance.add(healthyService);
        this.instance.add(idleService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.HEALTHY);
      }
    );

    it('returns correct health for a tree with healthy and na  services',
      function () {
        this.instance.add(healthyService);
        this.instance.add(naService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.HEALTHY);
      }
    );

    it('returns correct health for a tree with unhealthy services',
      function () {
        this.instance.add(unhealthyService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
      }
    );

    it('returns correct health for a tree with unhealthy and healthy services',
      function () {
        this.instance.add(unhealthyService);
        this.instance.add(healthyService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
      }
    );

    it('returns correct health for a tree with unhealthy and idle services',
      function () {
        this.instance.add(unhealthyService);
        this.instance.add(idleService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
      }
    );

    it('returns correct health for a tree with unhealthy and NA services',
      function () {
        this.instance.add(unhealthyService);
        this.instance.add(naService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
      }
    );

    it('returns correct health for a tree with idle services', function () {
      this.instance.add(idleService);

      expect(this.instance.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it('returns correct health for a tree with idle and NA services',
      function () {
        this.instance.add(idleService);
        this.instance.add(naService);

        expect(this.instance.getHealth()).toEqual(HealthStatus.IDLE);
      }
    );

    it('returns correct health for a tree with NA services', function () {
      this.instance.add(naService);

      expect(this.instance.getHealth()).toEqual(HealthStatus.NA);
    });

  });

  describe('#getResources', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns correct resource data', function () {
      this.instance.add(new Service({
        cpus: 1,
        mem: 2048,
        disk: 0
      }));
      this.instance.add(new Service({
        cpus: 6,
        mem: 1024,
        disk: 6
      }));

      expect(this.instance.getResources()).toEqual({
        cpus: 7,
        mem: 3072,
        disk: 6
      });
    });

  });

});
