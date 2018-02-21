const Application = require("../Application");
const Framework = require("../Framework");
const HealthStatus = require("../../constants/HealthStatus");
const HealthTypes = require("../../constants/HealthTypes");
const ServiceTree = require("../ServiceTree");
const ServiceStatus = require("../../constants/ServiceStatus");
const VolumeList = require("../../structs/VolumeList");

let thisInstance;

describe("ServiceTree", function() {
  describe("#constructor", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [
          {
            id: "group/test",
            items: []
          },
          {
            id: "/group/alpha"
          },
          {
            id: "/group/beta",
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          },
          {
            id: "/group/gamma",
            labels: {
              RANDOM_LABEL: "random"
            }
          },
          new Application({ id: "a" }),
          new Framework({ id: "b" })
        ],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });
    });

    it("defaults id to root tree (groups) id", function() {
      const tree = new ServiceTree({ apps: [], groups: [] });
      expect(tree.getId()).toEqual("/");
    });

    it("sets correct tree (group) id", function() {
      expect(thisInstance.getId()).toEqual("/group");
    });

    it("accepts nested trees", function() {
      expect(thisInstance.getItems()[0] instanceof ServiceTree).toEqual(true);
    });

    it("converts items into Application and Framework instances", function() {
      expect(thisInstance.getItems()[1] instanceof Application).toEqual(true);
      expect(thisInstance.getItems()[2] instanceof Framework).toEqual(true);
      expect(thisInstance.getItems()[3] instanceof Application).toEqual(true);
    });

    it("does not convert instances of service", function() {
      expect(thisInstance.getItems()[4].get()).toEqual({ id: "a" });
      expect(thisInstance.getItems()[5].get()).toEqual({ id: "b" });
    });
  });

  describe("#add", function() {
    it("adds a service", function() {
      const tree = new ServiceTree({ id: "/test", items: [] });
      tree.add(new Application({ id: "a" }));
      expect(tree.getItems()[0].get("id")).toEqual("a");
    });

    it("adds service like items", function() {
      const tree = new ServiceTree({ id: "/test", items: [] });
      tree.add({ id: "a" });
      expect(tree.getItems()[0].id).toEqual("a");
    });

    it("adds two items", function() {
      const tree = new ServiceTree({ id: "/test", items: [] });
      tree.add(new Application({ id: "a" }));
      tree.add(new Application({ id: "b" }));
      expect(tree.getItems()[0].get("id")).toEqual("a");
      expect(tree.getItems()[1].get("id")).toEqual("b");
    });

    it("adds items to current Tree", function() {
      const tree = new ServiceTree({
        id: "/test",
        items: [new Application({ id: "a" })]
      });
      tree.add(new Application({ id: "b" }));
      tree.add(new Application({ id: "c" }));

      expect(tree.getItems()[0].get("id")).toEqual("a");
      expect(tree.getItems()[1].get("id")).toEqual("b");
      expect(tree.getItems()[2].get("id")).toEqual("c");
    });
  });

  describe("#filterItemsByText", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [
          {
            id: "group/test",
            items: [
              {
                id: "group/test/foo"
              },
              {
                id: "group/test/bar"
              }
            ]
          },
          {
            id: "/group/alpha"
          },
          {
            id: "/group/beta",
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          },
          {
            id: "/group/gamma",
            labels: {
              RANDOM_LABEL: "random"
            }
          }
        ],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });
    });

    it("returns an instance of ServiceTree", function() {
      const filteredTree = thisInstance.filterItemsByText("alpha");
      expect(filteredTree instanceof ServiceTree).toBeTruthy();
    });

    it("includes matching trees", function() {
      const filteredItems = thisInstance.filterItemsByText("test").getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });

    it("does not include empty trees", function() {
      const filteredItems = thisInstance.filterItemsByText("beta").getItems();
      expect(filteredItems[0] instanceof Framework).toBeTruthy();
    });

    it("does no include matching subtrees", function() {
      const filteredItems = thisInstance.filterItemsByText("foo").getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });
  });

  describe("#filterItemsByFilter", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [
          {
            id: "/group/test",
            items: [
              {
                id: "/group/test/foo",
                cmd: "cmd"
              },
              {
                id: "/group/test/bar",
                cmd: "cmd"
              }
            ]
          },
          {
            id: "/group/alpha",
            cmd: "cmd"
          },
          {
            id: "/group/beta",
            cmd: "cmd",
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            },
            tasksHealthy: 1,
            tasksRunning: 1
          },
          {
            id: "gamma",
            cmd: "cmd",
            labels: {
              RANDOM_LABEL: "random"
            }
          }
        ],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });
    });

    it("filters by name", function() {
      const filteredServices = thisInstance
        .filterItemsByFilter({
          id: "alpha"
        })
        .getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual("/group/alpha");
    });

    it("filters by name in groups", function() {
      const filteredServices = thisInstance
        .filterItemsByFilter({
          id: "/group/test/foo"
        })
        .getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual("/group/test/foo");
    });

    it("filters by health", function() {
      const filteredServices = thisInstance
        .filterItemsByFilter({
          health: [HealthTypes.HEALTHY]
        })
        .getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual("/group/beta");
    });

    it("performs a logical AND with multiple filters", function() {
      const filteredServices = thisInstance
        .filterItemsByFilter({
          health: [HealthTypes.NA],
          id: "alpha"
        })
        .getItems();

      expect(filteredServices.length).toEqual(1);
      expect(filteredServices[0].getId()).toEqual("/group/alpha");
    });
  });

  describe("#findItem", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        items: [
          {
            id: "/test",
            items: []
          },
          {
            id: "/alpha"
          }
        ],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });
    });

    it("finds matching subtree", function() {
      expect(
        thisInstance
          .findItem(function(item) {
            return item.getId() === "/test";
          })
          .getId()
      ).toEqual("/test");
    });
  });

  describe("#getItemParent", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        id: "/",
        items: [
          {
            id: "test2",
            items: [
              {
                id: "test/testasd"
              }
            ]
          },
          {
            id: "/test",
            items: [
              {
                id: "/test/foo"
              },
              {
                id: "/test/bar"
              },
              {
                id: "/test/baz/boo",
                items: [
                  {
                    id: "/test/baz/boo/1"
                  }
                ]
              }
            ]
          },
          {
            id: "/alpha",
            cmd: "cmd"
          },
          {
            id: "/beta",
            cmd: "cmd",
            items: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          }
        ]
      });
    });

    it("finds matching parent from item two levels deep", function() {
      expect(thisInstance.getItemParent("/test/foo").getId()).toEqual("/test");
    });

    it("finds matching parent from item two levels deep", function() {
      expect(thisInstance.getItemParent("/test/bar").getId()).toEqual("/test");
    });

    it("finds matching parent from item three levels deep", function() {
      expect(thisInstance.getItemParent("/test/baz/boo/1").getId()).toEqual(
        "/test/baz/boo"
      );
    });

    it("finds matching parent from item one level deep", function() {
      expect(thisInstance.getItemParent("/alpha").getId()).toEqual("/");
    });

    it("returns null when root item searched", function() {
      expect(thisInstance.getItemParent("/")).toEqual(null);
    });

    it("returns null when no parent found", function() {
      expect(thisInstance.getItemParent("/not/found")).toEqual(null);
    });
  });

  describe("#findItemById", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        id: "/",
        items: [
          {
            id: "/test",
            items: [
              {
                id: "/test/foo"
              },
              {
                id: "/test/bar"
              }
            ]
          },
          {
            id: "/alpha",
            cmd: "cmd"
          },
          {
            id: "/beta",
            cmd: "cmd",
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          }
        ]
      });
    });

    it("finds matching item", function() {
      expect(thisInstance.findItemById("/beta").getId()).toEqual("/beta");
    });

    it("finds matching subtree item", function() {
      expect(thisInstance.findItemById("/test/foo").getId()).toEqual(
        "/test/foo"
      );
    });

    it("finds matching subtree", function() {
      expect(thisInstance.findItemById("/test").getId()).toEqual("/test");
    });
  });

  describe("#getDeployments", function() {
    it("returns an empty array", function() {
      const serviceTree = new ServiceTree({
        id: "/group/id",
        items: [
          {
            id: "/test",
            items: [
              {
                id: "/foo",
                cmd: "cmd",
                deployments: []
              },
              {
                id: "/bar",
                cmd: "cmd"
              }
            ]
          },
          {
            id: "/alpha",
            cmd: "cmd",
            deployments: []
          },
          {
            id: "/beta",
            cmd: "cmd",
            deployments: [],
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          },
          {
            id: "/gamma",
            cmd: "cmd",
            labels: {
              RANDOM_LABEL: "random"
            }
          }
        ]
      });

      expect(serviceTree.getDeployments()).toEqual([]);
    });

    it("returns an array with three deployments", function() {
      const serviceTree = new ServiceTree({
        id: "/group/id",
        items: [
          {
            id: "/test",
            items: [
              {
                id: "/foo",
                cmd: "cmd",
                deployments: [
                  {
                    id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1"
                  }
                ]
              },
              {
                id: "/bar",
                cmd: "cmd"
              }
            ]
          },
          {
            id: "/alpha",
            cmd: "cmd",
            deployments: [
              {
                id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f2"
              }
            ]
          },
          {
            id: "/beta",
            cmd: "cmd",
            deployments: [
              {
                id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f3"
              }
            ],
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          },
          {
            id: "/gamma",
            cmd: "cmd",
            labels: {
              RANDOM_LABEL: "random"
            }
          }
        ]
      });

      expect(serviceTree.getDeployments()).toEqual([
        { id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1" },
        { id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f2" },
        { id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f3" }
      ]);
    });
  });

  describe("#getHealth", function() {
    const healthyService = new Application({
      healthChecks: [{ path: "", protocol: "HTTP" }],
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 1,
      tasksUnhealthy: 0
    });
    const unhealthyService = new Application({
      healthChecks: [{ path: "", protocol: "HTTP" }],
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 0,
      tasksUnhealthy: 1
    });
    const idleService = new Application({
      healthChecks: [{ path: "", protocol: "HTTP" }],
      tasksStaged: 0,
      tasksRunning: 0,
      tasksHealthy: 0,
      tasksUnhealthy: 0
    });
    const naService = new Application({
      healthChecks: [],
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 0,
      tasksUnhealthy: 0
    });

    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns NA health for empty tree", function() {
      expect(thisInstance.getHealth()).toEqual(HealthStatus.NA);
    });

    it("returns correct health for a tree with healthy services", function() {
      thisInstance.add(healthyService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health for a tree with healthy and idle services", function() {
      thisInstance.add(healthyService);
      thisInstance.add(idleService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health for a tree with healthy and na  services", function() {
      thisInstance.add(healthyService);
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health for a tree with unhealthy services", function() {
      thisInstance.add(unhealthyService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with unhealthy and healthy services", function() {
      thisInstance.add(unhealthyService);
      thisInstance.add(healthyService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with unhealthy and idle services", function() {
      thisInstance.add(unhealthyService);
      thisInstance.add(idleService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with unhealthy and NA services", function() {
      thisInstance.add(unhealthyService);
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with idle services", function() {
      thisInstance.add(idleService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it("returns correct health for a tree with idle and NA services", function() {
      thisInstance.add(idleService);
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it("returns correct health for a tree with NA services", function() {
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.NA);
    });
  });

  describe("#getResources", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns correct resource data", function() {
      thisInstance.add(
        new Application({
          cpus: 1,
          mem: 2048,
          disk: 0,
          instances: 1
        })
      );
      thisInstance.add(
        new Application({
          cpus: 6,
          mem: 1024,
          disk: 6,
          instances: 1
        })
      );

      expect(thisInstance.getResources()).toEqual({
        cpus: 7,
        mem: 3072,
        disk: 6
      });
    });
  });

  describe("#getInstancesCount", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns correct number for instances for 0 instances", function() {
      thisInstance.add(
        new Application({
          instances: 0
        })
      );

      expect(thisInstance.getInstancesCount()).toEqual(0);
    });

    it("returns correct number for instances for 1 instance", function() {
      thisInstance.add(
        new Application({
          instances: 1
        })
      );

      expect(thisInstance.getInstancesCount()).toEqual(1);
    });

    it("returns correct number for instances for 5 instances", function() {
      thisInstance.add(
        new Application({
          instances: 3
        })
      );

      thisInstance.add(
        new Application({
          instances: 2
        })
      );

      expect(thisInstance.getInstancesCount()).toEqual(5);
    });
  });

  describe("#getStatus", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns correct status for running tree", function() {
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 1,
          deployments: []
        })
      );

      expect(thisInstance.getStatus()).toEqual(
        ServiceStatus.RUNNING.displayName
      );
    });

    it("returns correct status for stopped tree", function() {
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 0,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: []
        })
      );

      expect(thisInstance.getStatus()).toEqual(
        ServiceStatus.STOPPED.displayName
      );
    });

    it("returns correct status for deploying tree", function() {
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 15,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1" }]
        })
      );

      expect(thisInstance.getStatus()).toEqual(
        ServiceStatus.DEPLOYING.displayName
      );
    });
  });

  describe("#getServiceStatus", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns correct status object for running tree", function() {
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 1,
          deployments: []
        })
      );

      expect(thisInstance.getServiceStatus()).toEqual(ServiceStatus.RUNNING);
    });

    it("returns correct status object for stopped tree", function() {
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 0,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: []
        })
      );

      expect(thisInstance.getServiceStatus()).toEqual(ServiceStatus.STOPPED);
    });

    it("returns correct status object for deploying tree", function() {
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 15,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1" }]
        })
      );

      expect(thisInstance.getServiceStatus()).toEqual(ServiceStatus.DEPLOYING);
    });
  });

  describe("#getServices", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [
          {
            id: "group/test",
            items: []
          },
          {
            id: "/group/alpha"
          },
          {
            id: "/group/beta",
            labels: {
              DCOS_PACKAGE_FRAMEWORK_NAME: "beta"
            }
          },
          {
            id: "/group/gamma",
            labels: {
              RANDOM_LABEL: "random"
            }
          }
        ],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });
    });

    it("returns an array with all the Services in the group", function() {
      const services = thisInstance.getServices();
      expect(services.getItems().length).toEqual(3);
    });
  });

  describe("#getRunningInstancesCount", function() {
    const fooService = new Application();
    const barService = new Application({
      tasks: [{ foo: "bar" }, { bar: "baz" }]
    });
    const bazService = new Application({
      tasks: [{ foo: "bar" }]
    });

    it("returns the total number of reported tasks", function() {
      const serviceTree = new ServiceTree();

      serviceTree.add(fooService);
      serviceTree.add(barService);
      serviceTree.add(bazService);

      expect(serviceTree.getRunningInstancesCount()).toEqual(3);
    });
  });

  describe("#getTasksSummary", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns correct task summary", function() {
      thisInstance.add(
        new Application({
          instances: 1,
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 1,
          tasksUnhealthy: 0
        })
      );
      thisInstance.add(
        new Application({
          instances: 19,
          tasksStaged: 1,
          tasksRunning: 18,
          tasksHealthy: 15,
          tasksUnhealthy: 1
        })
      );

      expect(thisInstance.getTasksSummary()).toEqual({
        tasksStaged: 1,
        tasksRunning: 19,
        tasksHealthy: 16,
        tasksUnhealthy: 1,
        tasksUnknown: 2,
        tasksOverCapacity: 0
      });
    });

    it("returns correct task summary for Over Capacity", function() {
      thisInstance.add(
        new Application({
          instances: 1,
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 1,
          tasksUnhealthy: 0
        })
      );
      thisInstance.add(
        new Application({
          instances: 10,
          tasksStaged: 1,
          tasksRunning: 18,
          tasksHealthy: 15,
          tasksUnhealthy: 1
        })
      );

      expect(thisInstance.getTasksSummary()).toEqual({
        tasksStaged: 1,
        tasksRunning: 19,
        tasksHealthy: 16,
        tasksUnhealthy: 1,
        tasksUnknown: 2,
        tasksOverCapacity: 9
      });
    });
  });

  describe("#getVolumes", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns a VolumeList with all the volumes in the group", function() {
      thisInstance.add(
        new Application({
          id: "/persistent",
          volumes: [
            {
              containerPath: "data",
              mode: "RW",
              persistent: { size: 100 }
            }
          ]
        })
      );

      thisInstance.add(
        new Application({
          id: "/persistent2",
          volumes: [
            {
              containerPath: "data",
              mode: "RW",
              persistent: { size: 100 }
            }
          ]
        })
      );

      const volumeList = thisInstance.getVolumes();
      expect(volumeList).toEqual(jasmine.any(VolumeList));
      expect(volumeList.getItems().length).toEqual(2);
    });
  });

  describe("#getFrameworks", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns an array with all the Frameworks in the group", function() {
      thisInstance.add(
        new Framework({
          id: "/metronome"
        })
      );

      thisInstance.add(
        new Application({
          id: "/sleeper"
        })
      );

      const frameworks = thisInstance.getFrameworks();
      expect(frameworks.length).toEqual(1);
    });
  });

  describe("#getLabels", function() {
    beforeEach(function() {
      thisInstance = new ServiceTree();
    });

    it("returns an array with all the labels in the group", function() {
      thisInstance.add(
        new Framework({
          id: "/metronome",
          labels: {
            label_one: "value_one"
          }
        })
      );

      thisInstance.add(
        new Framework({
          id: "/cassandra",
          labels: {
            label_one: "value_two",
            label_two: "value_three"
          }
        })
      );

      thisInstance.add(
        new Application({
          id: "/sleeper"
        })
      );

      const labels = thisInstance.getLabels();
      expect(labels.length).toEqual(3);
      expect(labels).toEqual([
        { key: "label_one", value: "value_one" },
        { key: "label_one", value: "value_two" },
        { key: "label_two", value: "value_three" }
      ]);
    });

    it("filters out duplicate label key-value tuples", function() {
      thisInstance.add(
        new Framework({
          id: "/metronome",
          labels: {
            label_one: "value_one"
          }
        })
      );

      thisInstance.add(
        new Application({
          id: "/sleeper",
          labels: {
            label_one: "value_one",
            label_two: "value_one"
          }
        })
      );

      const labels = thisInstance.getLabels();
      expect(labels.length).toEqual(2);
      expect(labels).toEqual([
        { key: "label_one", value: "value_one" },
        { key: "label_two", value: "value_one" }
      ]);
    });

    it("returns an empty array if no labels are found", function() {
      thisInstance.add(
        new Framework({
          id: "/metronome"
        })
      );

      const labels = thisInstance.getLabels();
      expect(labels.length).toEqual(0);
      expect(labels).toEqual([]);
    });

    it("returns an empty array if tree is empty", function() {
      const labels = thisInstance.getLabels();
      expect(labels.length).toEqual(0);
      expect(labels).toEqual([]);
    });
  });
});
