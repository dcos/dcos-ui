let Application = require('../Application');
let Framework = require('../Framework');
let HealthStatus = require('../../constants/HealthStatus');
let HealthTypes = require('../../constants/HealthTypes');
let Service = require('../Service');
let ServiceTree = require('../ServiceTree');
let ServiceStatus = require('../../constants/ServiceStatus');
let VolumeList = require('../../structs/VolumeList');

describe('ServiceTree', function () {

  describe('#constructor', function () {

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group',
        items: [
          {
            id: 'group/test',
            items: []
          },
          {
            id: '/group/alpha'
          },
          {
            id: '/group/beta',
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            }
          },
          {
            id: '/group/gamma',
            labels: {
              RANDOM_LABEL: 'random'
            }
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

    it('sets correct tree (group) id', function () {
      expect(this.instance.getId()).toEqual('/group');
    });

    it('accepts nested trees', function () {
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
      let tree = new ServiceTree({id: '/test', items: [],});
      tree.add(new Application({id: 'a'}));
      expect(tree.getItems()[0].get('id')).toEqual('a');
    });

    it('adds service like items', function () {
      let tree = new ServiceTree({id: '/test', items: []});
      tree.add({id: 'a'});
      expect(tree.getItems()[0].id).toEqual('a');
    });

    it('adds two items', function () {
      let tree = new ServiceTree({id: '/test', items: []});
      tree.add(new Application({id: 'a'}));
      tree.add(new Application({id: 'b'}));
      expect(tree.getItems()[0].get('id')).toEqual('a');
      expect(tree.getItems()[1].get('id')).toEqual('b');
    });

    it('adds items to current Tree', function () {
      let tree = new ServiceTree({
        id: '/test',
        items: [new Application({id: 'a'})]
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
        id: '/group',
        items: [
          {
            id: 'group/test',
            items: [
              {
                id: 'group/test/foo',
              },
              {
                id: 'group/test/bar',
              }
            ]
          },
          {
            id: '/group/alpha'
          },
          {
            id: '/group/beta',
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            }
          },
          {
            id: '/group/gamma',
            labels: {
              RANDOM_LABEL: 'random'
            }
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

  describe('#filterItemsByFilter', function () {

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group',
        items: [
          {
            id: '/group/test',
            items: [
              {
                id: '/group/test/foo',
                cmd: 'cmd'
              },
              {
                id: '/group/test/bar',
                cmd: 'cmd'
              }
            ],
          },
          {
            id: '/group/alpha',
            cmd: 'cmd'
          },
          {
            id: '/group/beta',
            cmd: 'cmd',
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            },
            tasksHealthy: 1,
            tasksRunning: 1
          },
          {
            id: 'gamma',
            cmd: 'cmd',
            labels: {
              RANDOM_LABEL: 'random'
            }
          }
        ],
        filterProperties: {
          id: function (item) {
            return item.getId();
          }
        }
      });
    });

    it('should filter by name', function () {
      let filteredServices = this.instance.filterItemsByFilter({
        id: 'alpha'
      }).getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual('/group/alpha');
    });

    it('should filter by name in groups', function () {
      let filteredServices = this.instance.filterItemsByFilter({
        id: '/group/test/foo'
      }).getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual('/group/test');
    });

    it('should filter by health', function () {
      let filteredServices = this.instance.filterItemsByFilter({
        health: [HealthTypes.HEALTHY]
      }).getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual('/group/beta');
    });

    it('should perform a logical AND with multiple filters', function () {
      let filteredServices = this.instance.filterItemsByFilter({
        health: [HealthTypes.NA],
        id: 'alpha'
      }).getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual('/group/alpha');
    });
  });

  describe('#findItem', function () {

    beforeEach(function () {
      this.instance = new ServiceTree({
        items: [
          {
            id: '/test',
            items: []
          },
          {
            id: '/alpha'
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
        id: '/',
        items: [
          {
            id: '/test',
            items: [
              {
                id: '/test/foo',
              },
              {
                id: '/test/bar',
              }
            ],
          },
          {
            id: '/alpha',
            cmd: 'cmd'
          },
          {
            id: '/beta',
            cmd: 'cmd',
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            }
          }
        ]
      });
    });

    it('should find matching item', function () {
      expect(this.instance.findItemById('/beta').getId()).toEqual('/beta');
    });

    it('should find matching subtree item', function () {
      expect(this.instance.findItemById('/test/foo').getId())
        .toEqual('/test/foo');
    });

    it('should find matching subtree', function () {
      expect(this.instance.findItemById('/test').getId()).toEqual('/test');
    });

  });

  describe('#getDeployments', function () {

    it('should return an empty array', function () {
      let serviceTree = new ServiceTree({
        id: '/group/id',
        items: [
          {
            id: '/test',
            items: [
              {
                id: '/foo',
                cmd: 'cmd',
                deployments: []
              },
              {
                id: '/bar',
                cmd: 'cmd'
              }
            ],
          },
          {
            id: '/alpha',
            cmd: 'cmd',
            deployments: []
          },
          {
            id: '/beta',
            cmd: 'cmd',
            deployments: [],
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            }
          },
          {
            id: '/gamma',
            cmd: 'cmd',
            labels: {
              RANDOM_LABEL: 'random'
            }
          }
        ]
      });

      expect(serviceTree.getDeployments()).toEqual([]);
    });

    it('should return an array with three deployments', function () {
      let serviceTree = new ServiceTree({
        id: '/group/id',
        items: [
          {
            id: '/test',
            items: [
              {
                id: '/foo',
                cmd: 'cmd',
                deployments: [
                  {
                    id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'
                  }
                ]
              },
              {
                id: '/bar',
                cmd: 'cmd'
              }
            ]
          },
          {
            id: '/alpha',
            cmd: 'cmd',
            deployments: [
              {
                id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f2'
              }
            ]
          },
          {
            id: '/beta',
            cmd: 'cmd',
            deployments: [
              {
                id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f3'
              }
            ],
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            }
          },
          {
            id: '/gamma',
            cmd: 'cmd',
            labels: {
              RANDOM_LABEL: 'random'
            }
          }
        ]
      });

      expect(serviceTree.getDeployments()).toEqual([
        {id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'},
        {id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f2'},
        {id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f3'}
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

  describe('#getInstancesCount', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns correct number for instances for 0 instances', function () {
      this.instance.add(new Service({
        instances: 0
      }));

      expect(this.instance.getInstancesCount()).toEqual(0);
    });

    it('returns correct number for instances for 1 instance', function () {
      this.instance.add(new Service({
        instances: 1
      }));

      expect(this.instance.getInstancesCount()).toEqual(1);
    });

    it('returns correct number for instances for 5 instances', function () {
      this.instance.add(new Service({
        instances: 3
      }));

      this.instance.add(new Service({
        instances: 2
      }));

      expect(this.instance.getInstancesCount()).toEqual(5);
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

      expect(this.instance.getStatus())
        .toEqual(ServiceStatus.RUNNING.displayName);
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

      expect(this.instance.getStatus())
        .toEqual(ServiceStatus.SUSPENDED.displayName);
    });

    it('returns correct status for deploying tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'}]
      }));

      expect(this.instance.getStatus())
        .toEqual(ServiceStatus.DEPLOYING.displayName);
    });

  });

  describe('#getServiceStatus', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns correct status object for running tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      }));

      expect(this.instance.getServiceStatus())
        .toEqual(ServiceStatus.RUNNING);
    });

    it('returns correct status object for suspended tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      }));

      expect(this.instance.getServiceStatus())
        .toEqual(ServiceStatus.SUSPENDED);
    });

    it('returns correct status object for deploying tree', function () {
      this.instance.add(new Service({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'}]
      }));

      expect(this.instance.getServiceStatus())
        .toEqual(ServiceStatus.DEPLOYING);
    });

  });

  describe('#getServices', function () {

    beforeEach(function () {
      this.instance = new ServiceTree({
        id: '/group',
        items: [
          {
            id: 'group/test',
            items: []
          },
          {
            id: '/group/alpha'
          },
          {
            id: '/group/beta',
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'
            }
          },
          {
            id: '/group/gamma',
            labels: {
              RANDOM_LABEL: 'random'
            }
          }
        ],
        filterProperties: {
          id: function (item) {
            return item.getId();
          }
        }
      });
    });

    it('returns an array with all the Services in the group', function () {
      let services = this.instance.getServices();
      expect(services.getItems().length).toEqual(3);
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
        tasksRunning: 18,
        tasksHealthy: 15,
        tasksUnhealthy: 1
      }));

      expect(this.instance.getTasksSummary()).toEqual({
        tasksStaged: 1,
        tasksRunning: 19,
        tasksHealthy: 16,
        tasksUnhealthy: 1,
        tasksUnknown: 2
      });
    });

  });

  describe('#getVolumes', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns a VolumeList with all the volumes in the group', function () {
      this.instance.add(new Service({
        id: '/persistent',
        volumes: [{
          containerPath: 'data',
          mode: 'RW',
          persistent: {size: 100}
        }]
      }));

      this.instance.add(new Service({
        id: '/persistent2',
        volumes: [{
          containerPath: 'data',
          mode: 'RW',
          persistent: {size: 100}
        }]
      }));

      let volumeList = this.instance.getVolumes();
      expect(volumeList).toEqual(jasmine.any(VolumeList));
      expect(volumeList.getItems().length).toEqual(2);
    });

  });

  describe('#getFrameworks', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns an array with all the Frameworks in the group', function () {
      this.instance.add(new Framework({
        id: '/metronome'
      }));

      this.instance.add(new Service({
        id: '/sleeper'
      }));

      let frameworks = this.instance.getFrameworks();
      expect(frameworks.length).toEqual(1);
    });

  });

  describe('#getLabels', function () {

    beforeEach(function () {
      this.instance = new ServiceTree();
    });

    it('returns an array with all the labels in the group', function () {
      this.instance.add(new Framework({
        id: '/metronome',
        labels: {
          'label_one': 'value_one'
        }
      }));

      this.instance.add(new Framework({
        id: '/cassandra',
        labels: {
          'label_one': 'value_two',
          'label_two': 'value_three'
        }
      }));

      this.instance.add(new Service({
        id: '/sleeper'
      }));

      let labels = this.instance.getLabels();
      expect(labels.length).toEqual(3);
      expect(labels).toEqual([
        {key: 'label_one', value: 'value_one'},
        {key: 'label_one', value:  'value_two'},
        {key: 'label_two', value:  'value_three'}
      ]);
    });

    it('filters out duplicate label key-value tuples', function () {
      this.instance.add(new Framework({
        id: '/metronome',
        labels: {
          'label_one': 'value_one'
        }
      }));

      this.instance.add(new Service({
        id: '/sleeper',
        labels: {
          'label_one': 'value_one',
          'label_two': 'value_one'
        }
      }));

      let labels = this.instance.getLabels();
      expect(labels.length).toEqual(2);
      expect(labels).toEqual([
        {key: 'label_one', value: 'value_one'},
        {key: 'label_two', value:  'value_one'}
      ]);
    });

    it('returns an empty array if no labels are found', function () {
      this.instance.add(new Framework({
        id: '/metronome'
      }));

      let labels = this.instance.getLabels();
      expect(labels.length).toEqual(0);
      expect(labels).toEqual([]);
    });

    it('returns an empty array if tree is empty', function () {
      let labels = this.instance.getLabels();
      expect(labels.length).toEqual(0);
      expect(labels).toEqual([]);
    });

  });

});
