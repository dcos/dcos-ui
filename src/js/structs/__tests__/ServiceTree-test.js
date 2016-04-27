let Application = require('../Application');
let Framework = require('../Framework');
let HealthStatus = require('../../constants/HealthStatus');
let Service = require('../Service');
let ServiceTree = require('../ServiceTree');
let StatusLabels = require('../../constants/StatusLabels');

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

  describe('#filterItemsByText', function () {

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
      let filteredTree = this.instance.filterItemsByText('alpha');
      expect(filteredTree instanceof ServiceTree).toBeTruthy();
    });

    it('should include matching trees', function () {
      let filteredItems = this.instance.filterItemsByText('test').getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });

    it('should not include empty trees', function () {
      let filteredItems = this.instance.filterItemsByText('beta').getItems();
      expect(filteredItems[0] instanceof Framework).toBeTruthy();
    });

    it('should no include matching subtrees', function () {
      let filteredItems = this.instance.filterItemsByText('foo').getItems();
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

  describe('#findItemById', function () {

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group/id',
        apps: [
          {id: '/alpha', cmd: 'cmd'},
          {
            id: '/beta',
            cmd: 'cmd',
            labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          },
          {id: '/gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
        ],
        groups: [
          {
            id: '/test', apps: [
            {id: '/foo', cmd: 'cmd'},
            {id: '/bar', cmd: 'cmd'}
          ], groups: []
          }
        ]
      });
    });


    it('should find matching item', function () {
      expect(this.instance.findItemById('/beta').getId()).toEqual('/beta');
    });

    it('should find matching subtree item', function () {
      expect(this.instance.findItemById('/foo').getId()).toEqual('/foo');
    });

    it('should find matching subtree', function () {
      expect(this.instance.findItemById('/test').getId()).toEqual('/test');
    });

  });

  describe('#getDeployments', function () {
    it('should return an empty array', function () {
      let serviceTree = new ServiceTree({
        id: '/group/id',
        apps: [
          {id: '/alpha', cmd: 'cmd', deployments: []},
          {
            id: '/beta',
            cmd: 'cmd',
            deployments: [],
            labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          },
          {id: '/gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
        ],
        groups: [
          {
            id: '/test', apps: [
            {id: '/foo', cmd: 'cmd', deployments: []},
            {id: '/bar', cmd: 'cmd'}
          ], groups: []
          }
        ]

      });

      expect(serviceTree.getDeployments()).toEqual([]);
    });

    it('should return an array with three deployments', function () {
      let serviceTree = new ServiceTree(
        {
          id: '/group/id',
          apps: [
            {id: '/alpha', cmd: 'cmd', deployments: [{id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f2"}]},
            {
              id: '/beta',
              cmd: 'cmd',
              deployments: [{id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f3"}],
              labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
            },
            {id: '/gamma', cmd: 'cmd', labels: {RANDOM_LABEL: 'random'}}
          ],
          groups: [
            {
              id: '/test', apps: [
              {id: '/foo', cmd: 'cmd', deployments: [{id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1"}]},
              {id: '/bar', cmd: 'cmd'}
            ], groups: []
            }
          ]

        });

      expect(serviceTree.getDeployments()).toEqual([
        {id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1"},
        {id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f2"},
        {id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f3"}
      ]);
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

  describe('#getInstances', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns correct number for instances for 0 instances', function () {
      this.instance.add(new Service({
        instances: 0
      }));

      expect(this.instance.getInstances()).toEqual(0);
    });

    it('returns correct number for instances for 1 instance', function () {
      this.instance.add(new Service({
        instances: 1
      }));

      expect(this.instance.getInstances()).toEqual(1);
    });

    it('returns correct number for instances for 5 instances', function () {
      this.instance.add(new Service({
        instances: 3
      }));

      this.instance.add(new Service({
        instances: 2
      }));

      expect(this.instance.getInstances()).toEqual(5);
    });

  });

  describe('#getStatus', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns correct status for running tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      }));

      expect(this.instance.getStatus()).toEqual(StatusLabels.RUNNING);
    });

    it('returns correct status for suspended tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      }));

      expect(this.instance.getStatus()).toEqual(StatusLabels.SUSPENDED);
    });

    it('returns correct status for deploying tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1"}]
      }));

      expect(this.instance.getStatus()).toEqual(StatusLabels.DEPLOYING);
    });

  });

  describe('#getTasksSummary', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns correct task summary', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      }));
      this.instance.add(new Service({
        tasksStaged: 1,
        tasksRunning: 3,
        tasksHealthy: 15,
        tasksUnhealthy: 1
      }));

      expect(this.instance.getTasksSummary()).toEqual({
        tasksStaged: 1,
        tasksRunning: 4,
        tasksHealthy: 16,
        tasksUnhealthy: 1,
        tasksUnknown: -13
      });
    });

  });

});
