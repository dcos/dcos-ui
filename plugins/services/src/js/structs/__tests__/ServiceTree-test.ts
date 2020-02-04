import * as ServiceStatus from "../../constants/ServiceStatus";

import Application from "../Application";
import Framework from "../Framework";
import HealthStatus from "../../constants/HealthStatus";
import ServiceTree from "../ServiceTree";

let thisInstance;

const runningApp = opts =>
  new Application({
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 1,
    tasksUnhealthy: 0,
    instances: 1,
    deployments: [],
    ...opts
  });

describe("ServiceTree", () => {
  describe("#constructor", () => {
    beforeEach(() => {
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

    it("defaults id to root tree (groups) id", () => {
      const tree = new ServiceTree({ apps: [], groups: [] });
      expect(tree.getId()).toEqual("/");
    });

    it("sets correct tree (group) id", () => {
      expect(thisInstance.getId()).toEqual("/group");
    });

    it("accepts nested trees", () => {
      expect(thisInstance.getItems()[0] instanceof ServiceTree).toEqual(true);
    });

    it("converts items into Application and Framework instances", () => {
      expect(thisInstance.getItems()[1] instanceof Application).toEqual(true);
      expect(thisInstance.getItems()[2] instanceof Framework).toEqual(true);
      expect(thisInstance.getItems()[3] instanceof Application).toEqual(true);
    });

    it("does not convert instances of service", () => {
      expect(thisInstance.getItems()[4].get()).toEqual({ id: "a" });
      expect(thisInstance.getItems()[5].get()).toEqual({ id: "b" });
    });
  });

  describe("#add", () => {
    it("adds a service", () => {
      const tree = new ServiceTree({ id: "/test", items: [] });
      tree.add(new Application({ id: "a" }));
      expect(tree.getItems()[0].get("id")).toEqual("a");
    });

    it("adds service like items", () => {
      const tree = new ServiceTree({ id: "/test", items: [] });
      tree.add({ id: "a" });
      expect(tree.getItems()[0].id).toEqual("a");
    });

    it("adds two items", () => {
      const tree = new ServiceTree({ id: "/test", items: [] });
      tree.add(new Application({ id: "a" }));
      tree.add(new Application({ id: "b" }));
      expect(tree.getItems()[0].get("id")).toEqual("a");
      expect(tree.getItems()[1].get("id")).toEqual("b");
    });

    it("adds items to current Tree", () => {
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

  describe("#filterItemsByText", () => {
    beforeEach(() => {
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

    it("returns an instance of ServiceTree", () => {
      const filteredTree = thisInstance.filterItemsByText("alpha");
      expect(filteredTree instanceof ServiceTree).toBeTruthy();
    });

    it("includes matching trees", () => {
      const filteredItems = thisInstance.filterItemsByText("test").getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });

    it("does not include empty trees", () => {
      const filteredItems = thisInstance.filterItemsByText("beta").getItems();
      expect(filteredItems[0] instanceof Framework).toBeTruthy();
    });

    it("does no include matching subtrees", () => {
      const filteredItems = thisInstance.filterItemsByText("foo").getItems();
      expect(filteredItems[0] instanceof ServiceTree).toBeTruthy();
    });
  });

  describe("#findItem", () => {
    beforeEach(() => {
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

    it("finds matching subtree", () => {
      expect(
        thisInstance.findItem(item => item.getId() === "/test").getId()
      ).toEqual("/test");
    });
  });

  describe("#getItemParent", () => {
    beforeEach(() => {
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

    it("finds matching parent from item two levels deep", () => {
      expect(thisInstance.getItemParent("/test/foo").getId()).toEqual("/test");
    });

    it("finds matching parent from item two levels deep", () => {
      expect(thisInstance.getItemParent("/test/bar").getId()).toEqual("/test");
    });

    it("finds matching parent from item three levels deep", () => {
      expect(thisInstance.getItemParent("/test/baz/boo/1").getId()).toEqual(
        "/test/baz/boo"
      );
    });

    it("finds matching parent from item one level deep", () => {
      expect(thisInstance.getItemParent("/alpha").getId()).toEqual("/");
    });

    it("returns null when root item searched", () => {
      expect(thisInstance.getItemParent("/")).toEqual(null);
    });

    it("returns null when no parent found", () => {
      expect(thisInstance.getItemParent("/not/found")).toEqual(null);
    });
  });

  describe("#findItemById", () => {
    beforeEach(() => {
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

    it("finds matching item", () => {
      expect(thisInstance.findItemById("/beta").getId()).toEqual("/beta");
    });

    it("finds matching subtree item", () => {
      expect(thisInstance.findItemById("/test/foo").getId()).toEqual(
        "/test/foo"
      );
    });

    it("finds matching subtree", () => {
      expect(thisInstance.findItemById("/test").getId()).toEqual("/test");
    });
  });

  describe("#getHealth", () => {
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

    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns NA health for empty tree", () => {
      expect(thisInstance.getHealth()).toEqual(HealthStatus.NA);
    });

    it("returns correct health for a tree with healthy services", () => {
      thisInstance.add(healthyService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health for a tree with healthy and idle services", () => {
      thisInstance.add(healthyService);
      thisInstance.add(idleService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health for a tree with healthy and na  services", () => {
      thisInstance.add(healthyService);
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health for a tree with unhealthy services", () => {
      thisInstance.add(unhealthyService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with unhealthy and healthy services", () => {
      thisInstance.add(unhealthyService);
      thisInstance.add(healthyService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with unhealthy and idle services", () => {
      thisInstance.add(unhealthyService);
      thisInstance.add(idleService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with unhealthy and NA services", () => {
      thisInstance.add(unhealthyService);
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health for a tree with idle services", () => {
      thisInstance.add(idleService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it("returns correct health for a tree with idle and NA services", () => {
      thisInstance.add(idleService);
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it("returns correct health for a tree with NA services", () => {
      thisInstance.add(naService);

      expect(thisInstance.getHealth()).toEqual(HealthStatus.NA);
    });
  });

  describe("#getResources", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns correct resource data", () => {
      thisInstance.add(
        new Application({
          cpus: 1,
          mem: 2048,
          disk: 0,
          gpus: 2,
          instances: 1
        })
      );
      thisInstance.add(
        new Application({
          cpus: 6,
          mem: 1024,
          disk: 6,
          gpus: 8,
          instances: 1
        })
      );

      expect(thisInstance.getResources()).toEqual({
        cpus: 7,
        mem: 3072,
        disk: 6,
        gpus: 10
      });
    });
  });

  describe("#getInstancesCount", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns correct number for instances for 0 instances", () => {
      thisInstance.add(
        new Application({
          instances: 0
        })
      );

      expect(thisInstance.getInstancesCount()).toEqual(0);
    });

    it("returns correct number for instances for 1 instance", () => {
      thisInstance.add(
        new Application({
          instances: 1
        })
      );

      expect(thisInstance.getInstancesCount()).toEqual(1);
    });

    it("returns correct number for instances for 5 instances", () => {
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

  describe("#getStatus", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns correct status for running tree", () => {
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

    it("returns correct status for stopped tree", () => {
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

    it("returns correct status for deploying tree", () => {
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

  describe("#getServiceTreeStatusSummary", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns correct status for running tree", () => {
      thisInstance.add(runningApp());

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: ServiceStatus.StatusCategory.RUNNING,
        counts: {
          status: {
            RUNNING: 1
          },
          total: 1
        }
      });
    });

    it("returns correct status for stopped tree", () => {
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

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: ServiceStatus.StatusCategory.STOPPED,
        counts: {
          status: {
            STOPPED: 1
          },
          total: 1
        }
      });
    });

    it("returns correct status for deploying tree", () => {
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

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: ServiceStatus.StatusCategory.LOADING,
        counts: {
          status: {
            LOADING: 1
          },
          total: 1
        }
      });
    });

    it("aggregates status to a summary", () => {
      thisInstance.add(runningApp());
      thisInstance.add(runningApp());

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: ServiceStatus.StatusCategory.RUNNING,
        counts: {
          status: {
            RUNNING: 2
          },
          total: 2
        }
      });
    });

    it("aggregates status by icon to a summary", () => {
      thisInstance.add(runningApp());
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
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 2,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1" }],
          queue: {
            delay: true
          }
        })
      );

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: "LOADING",
        counts: {
          status: {
            LOADING: 2,
            RUNNING: 1
          },
          total: 3
        }
      });
    });

    it("aggregates highest priority to summary", () => {
      thisInstance.add(runningApp());
      thisInstance.add(new Application({ tasksRunning: 0 }));
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: [],
          queue: {
            delay: true
          }
        })
      );

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: "LOADING",
        counts: {
          status: {
            LOADING: 1,
            STOPPED: 1,
            RUNNING: 1
          },
          total: 3
        }
      });
    });

    it("aggregate handles NA status", () => {
      thisInstance.add(runningApp());
      thisInstance.add(runningApp());
      thisInstance.add(
        new Application({
          tasksStaged: 0,
          tasksRunning: 0,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 1,
          deployments: null,
          queue: null
        })
      );

      expect(thisInstance.getServiceTreeStatusSummary()).toEqual({
        status: "RUNNING",
        counts: {
          status: {
            NA: 1,
            RUNNING: 2
          },
          total: 3
        }
      });
    });
  });

  describe("#getServiceStatus", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns correct status object for running tree", () => {
      thisInstance.add(runningApp());

      expect(thisInstance.getServiceStatus()).toEqual(ServiceStatus.RUNNING);
    });

    it("returns correct status object for stopped tree", () => {
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

    it("returns correct status object for deploying tree", () => {
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

  describe("#getServices", () => {
    beforeEach(() => {
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

    it("returns an array with all the Services in the group", () => {
      const services = thisInstance.getServices();
      expect(services.getItems().length).toEqual(3);
    });
  });

  describe("#getGroups", () => {
    beforeEach(() => {
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

    it("returns an array with all the sub-groups in the group", () => {
      const groups = thisInstance.getGroups();
      expect(groups.getItems().length).toEqual(1);
    });
  });

  describe("#getRunningInstancesCount", () => {
    const fooService = new Application();
    const barService = new Application({
      tasks: [{ foo: "bar" }, { bar: "baz" }]
    });
    const bazService = new Application({
      tasks: [{ foo: "bar" }]
    });

    it("returns the total number of reported tasks", () => {
      const serviceTree = new ServiceTree();

      serviceTree.add(fooService);
      serviceTree.add(barService);
      serviceTree.add(bazService);

      expect(serviceTree.getRunningInstancesCount()).toEqual(3);
    });
  });

  describe("#getTasksSummary", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns correct task summary", () => {
      thisInstance.add(runningApp({ tasksHealthy: 1 }));
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

    it("returns correct task summary for Over Capacity", () => {
      thisInstance.add(runningApp({ tasksHealthy: 1 }));
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

  describe("#getVolumes", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns a List with all the volumes in the group", () => {
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
      expect(volumeList.length).toEqual(2);
    });
  });

  describe("#getFrameworks", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns an array with all the Frameworks in the group", () => {
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

  describe("#getLabels", () => {
    beforeEach(() => {
      thisInstance = new ServiceTree();
    });

    it("returns an array with all the labels in the group", () => {
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

    it("returns an empty array if no labels are found", () => {
      thisInstance.add(
        new Framework({
          id: "/metronome"
        })
      );

      const labels = thisInstance.getLabels();
      expect(labels.length).toEqual(0);
      expect(labels).toEqual([]);
    });

    it("returns an empty array if tree is empty", () => {
      const labels = thisInstance.getLabels();
      expect(labels.length).toEqual(0);
      expect(labels).toEqual([]);
    });
  });

  describe("#getEnforceRole", () => {
    it("returns enforceRole when true", () => {
      thisInstance = new ServiceTree({
        id: "/group",
        enforceRole: true,
        items: [],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });

      expect(thisInstance.getEnforceRole()).toEqual(true);
    });

    it("returns enforceRole when false", () => {
      thisInstance = new ServiceTree({
        id: "/group",
        enforceRole: false,
        items: [],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });

      expect(thisInstance.getEnforceRole()).toEqual(false);
    });

    it("returns undefined when enforceRole not set", () => {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [],
        filterProperties: {
          id(item) {
            return item.getId();
          }
        }
      });

      expect(thisInstance.getEnforceRole()).toBeUndefined();
    });
  });

  describe("#isRoot", () => {
    it("returns true when id is /", () => {
      thisInstance = new ServiceTree({
        id: "/"
      });

      expect(thisInstance.isRoot()).toEqual(true);
    });

    it("returns false when id is not /", () => {
      thisInstance = new ServiceTree({
        id: "/group"
      });

      expect(thisInstance.isRoot()).toEqual(false);
    });
  });

  describe("#isTopLevel", () => {
    it("returns true when the group is top level", () => {
      thisInstance = new ServiceTree({
        id: "/group"
      });

      expect(thisInstance.isTopLevel()).toEqual(true);
    });

    it("returns false when the group is nested", () => {
      thisInstance = new ServiceTree({
        id: "/group/group2"
      });

      expect(thisInstance.isTopLevel()).toEqual(false);
    });

    it("returns false when the group is root", () => {
      thisInstance = new ServiceTree({
        id: "/"
      });

      expect(thisInstance.isTopLevel()).toEqual(false);
    });
  });

  describe("#getQuotaRoleStats", () => {
    it("returns the correct numbers", () => {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [
          {
            role: "slave_public"
          }
        ]
      });

      expect(thisInstance.getQuotaRoleStats()).toEqual({
        count: 1,
        rolesCount: 1,
        groupRoleCount: 0
      });
    });

    it("return the correct numbers for nested groups", () => {
      thisInstance = new ServiceTree({
        id: "/group",
        items: [
          new ServiceTree({
            id: "/group/group2",
            items: [
              {
                role: "group"
              },
              {
                role: "slave_public"
              }
            ]
          }),
          {
            role: "group"
          },
          {
            role: "slave_public"
          }
        ]
      });

      expect(thisInstance.getQuotaRoleStats()).toEqual({
        count: 4,
        rolesCount: 4,
        groupRoleCount: 2
      });
    });
  });
});
