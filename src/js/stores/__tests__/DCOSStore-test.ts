import DCOSStore from "../DCOSStore";
import NotificationStore from "../NotificationStore";
import DeploymentsList from "../../../../plugins/services/src/js/structs/DeploymentsList";
import ServiceTree from "../../../../plugins/services/src/js/structs/ServiceTree";
import SummaryList from "../../structs/SummaryList";
import StateSummary from "../../structs/StateSummary";
import * as EventTypes from "../../constants/EventTypes";

jest.mock("../MesosSummaryStore");
jest.mock("../../../../plugins/services/src/js/stores/MarathonStore");

const MesosSummaryStore = require("../MesosSummaryStore").default;
const MarathonStore = require("../../../../plugins/services/src/js/stores/MarathonStore")
  .default;

describe("DCOSStore", () => {
  beforeEach(() => {
    // Mock Marathon and  Mesos  data and handle data change
    MarathonStore.__setKeyResponse("groups", new ServiceTree({ apps: [] }));
    MarathonStore.__setKeyResponse(
      "deployments",
      new DeploymentsList({
        items: []
      })
    );
    MesosSummaryStore.__setKeyResponse(
      "states",
      new SummaryList({
        items: [
          new StateSummary({
            successful: true
          })
        ]
      })
    );

    DCOSStore.onMarathonDeploymentsChange();
    DCOSStore.onMarathonGroupsChange();
    DCOSStore.onMesosSummaryChange();
  });

  describe("#constructor", () => {
    it("exposes an empty deployments list", () => {
      expect(DCOSStore.deploymentsList.getItems().length).toEqual(0);
    });
  });

  describe("#emit", () => {
    it("calls arbitrary event handler directly", () => {
      const handler = jasmine.createSpy("handler");
      DCOSStore.on("direct", handler);
      DCOSStore.emit("direct");
      expect(handler).toHaveBeenCalled();
    });

    it("debounces change event handler calls", () => {
      const handler = jasmine.createSpy("handler");
      DCOSStore.on(EventTypes.DCOS_CHANGE, handler);
      DCOSStore.emit(EventTypes.DCOS_CHANGE);
      jest.advanceTimersByTime(250);
      expect(handler).toHaveBeenCalled();
    });

    it("debounce calls change event handler only once after consecutive calls", () => {
      const handler = jasmine.createSpy("handler");
      DCOSStore.on(EventTypes.DCOS_CHANGE, handler);
      DCOSStore.emit(EventTypes.DCOS_CHANGE);
      expect(handler).not.toHaveBeenCalled();
      DCOSStore.emit(EventTypes.DCOS_CHANGE);
      expect(handler).not.toHaveBeenCalled();
      jest.advanceTimersByTime(250);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("#onMarathonDeploymentsChange", () => {
    beforeEach(() => {
      MarathonStore.__setKeyResponse(
        "deployments",
        new DeploymentsList({
          items: [
            {
              id: "deployment-id",
              version: "2001-01-01T01:01:01.001Z",
              affectedApps: ["/app1", "/app2"],
              currentStep: 2,
              totalSteps: 3
            }
          ]
        })
      );
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            { id: "/app1", cmd: "sleep 1000" },
            { id: "/app2", cmd: "sleep 1000" }
          ]
        })
      );
      spyOn(NotificationStore, "addNotification");
      // DCOSStore is a singleton, need to reset it manually
      DCOSStore.data.marathon.dataReceived = false;
    });

    describe("when the groups endpoint is not populated", () => {
      beforeEach(() => {
        DCOSStore.onMarathonDeploymentsChange();
      });

      it("does not update the deployments list", () => {
        expect(DCOSStore.deploymentsList.getItems().length).toEqual(0);
      });

      it("does not update the notification store", () => {
        expect(NotificationStore.addNotification).not.toHaveBeenCalled();
      });

      it("is called as soon as groups endpoint data arrives", () => {
        spyOn(DCOSStore, "onMarathonDeploymentsChange");
        DCOSStore.onMarathonGroupsChange();
        expect(DCOSStore.onMarathonDeploymentsChange).toHaveBeenCalled();
      });
    });

    describe("when the groups endpoint is already populated", () => {
      beforeEach(() => {
        DCOSStore.onMarathonGroupsChange();
        DCOSStore.onMarathonDeploymentsChange();
      });

      it("updates the deployments list", () => {
        expect(DCOSStore.deploymentsList.getItems().length).toEqual(1);
        expect(DCOSStore.deploymentsList.last().id).toEqual("deployment-id");
      });

      it("populates the deployments with relevant services", () => {
        const deployment = DCOSStore.deploymentsList.last();
        const services = deployment.getAffectedServices();
        expect(services.length).toEqual(2);
      });

      it("updates the notification store", () => {
        expect(NotificationStore.addNotification).toHaveBeenCalledWith(
          "services-deployments",
          "deployment-count",
          1
        );
      });
    });

    describe("when the deployments endpoint references stale services", () => {
      beforeEach(() => {
        DCOSStore.onMarathonDeploymentsChange();
        MarathonStore.__setKeyResponse("groups", new ServiceTree({ apps: [] }));
        DCOSStore.onMarathonGroupsChange();
      });

      it("trims stale services", () => {
        const deployment = DCOSStore.deploymentsList.last();
        const services = deployment.getAffectedServices();
        expect(services.length).toEqual(0);
      });
    });
  });

  describe("#onMarathonGroupsChange", () => {
    beforeEach(() => {
      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [
                  {
                    id: "alpha-id",
                    name: "alpha",
                    bar: "baz"
                  }
                ]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();
    });

    it("updates the service tree", () => {
      expect(DCOSStore.serviceTree.getItems().length).toEqual(0);

      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/alpha",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "alpha" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual("/alpha");
    });

    it("replaces old Marathon data", () => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/alpha",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "alpha" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/beta",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "beta" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();
      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual("/beta");
    });

    it("merges (matching by id) summary data", () => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/alpha",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "alpha" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual("/alpha");
      expect(DCOSStore.serviceTree.getItems()[0].get("bar")).toEqual("baz");
    });

    it("does not merge summary data if it doesn't find a matching id", () => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/beta",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "beta" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();

      expect(DCOSStore.serviceTree.getItems()[0].get("bar")).toBeUndefined();
    });

    it("does not include _itemData", () => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/alpha",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "alpha" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();

      expect(
        DCOSStore.serviceTree.getItems()[0].get()._itemData
      ).not.toBeDefined();
    });
  });

  describe("#onMarathonQueueChange", () => {
    const serviceId = "/alpha";
    beforeEach(() => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: serviceId
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();
      DCOSStore.onMarathonQueueChange([
        {
          app: {
            id: serviceId
          },
          delay: {
            timeLeftSeconds: 0,
            overdue: true
          }
        }
      ]);
    });

    it("updates the service tree", () => {
      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).toEqual(
        "Recovering"
      );

      DCOSStore.onMarathonQueueChange([
        {
          app: {
            id: serviceId
          },
          delay: {
            timeLeftSeconds: 0,
            overdue: false
          }
        }
      ]);

      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).toEqual(
        "Delayed"
      );
    });

    it("converts running apps from waiting state", () => {
      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).toEqual(
        "Recovering"
      );
      DCOSStore.onMarathonQueueChange([]);
      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).not.toEqual(
        "Recovering"
      );
    });

    it("does not include _itemData", () => {
      DCOSStore.onMarathonQueueChange([
        {
          app: {
            id: serviceId
          },
          delay: {
            timeLeftSeconds: 0,
            overdue: false
          }
        }
      ]);

      expect(
        DCOSStore.serviceTree.getItems()[0].get()._itemData
      ).not.toBeDefined();
    });
  });

  describe("#processMarathonServiceVersion", () => {
    const versionID = "2016-03-22T10:46:07.354Z";

    beforeEach(() => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/alpha"
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();
      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: "/alpha",
        versions: new Map([[versionID]])
      });
    });

    it("updates the service tree", () => {
      expect(DCOSStore.serviceTree.getItems()[0].getVersions()).toEqual(
        new Map([[versionID]])
      );

      DCOSStore.onMarathonServiceVersionChange({
        serviceID: "/alpha",
        versionID,
        version: { foo: "bar" }
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions()).toEqual(
        new Map([[versionID, { foo: "bar" }]])
      );
    });

    it("does not include _itemData", () => {
      DCOSStore.onMarathonServiceVersionChange({
        serviceID: "/alpha",
        versionID,
        version: { foo: "bar" }
      });

      expect(
        DCOSStore.serviceTree.getItems()[0].get()._itemData
      ).not.toBeDefined();
    });
  });

  describe("#processMarathonServiceVersions", () => {
    const firstVersionID = "2016-03-22T10:46:07.354Z";
    const secondVersionID = "2016-04-22T10:46:07.354Z";

    beforeEach(() => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/beta"
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();
    });

    it("updates the service tree", () => {
      expect(DCOSStore.serviceTree.getItems()[0].getVersions()).toEqual(
        new Map()
      );

      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: "/beta",
        versions: new Map([[firstVersionID]])
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions()).toEqual(
        new Map([[firstVersionID]])
      );
    });

    it("merges existing version data", () => {
      DCOSStore.onMarathonServiceVersionChange({
        serviceID: "/beta",
        versionID: firstVersionID,
        version: { foo: "bar" }
      });

      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: "/beta",
        versions: new Map([[firstVersionID], [secondVersionID]])
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions()).toEqual(
        new Map([[firstVersionID, { foo: "bar" }], [secondVersionID]])
      );
    });

    it("does not include _itemData", () => {
      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: "/beta",
        versions: new Map([[firstVersionID]])
      });

      expect(
        DCOSStore.serviceTree.getItems()[0].get()._itemData
      ).not.toBeDefined();
    });
  });

  describe("#onMesosSummaryChange", () => {
    beforeEach(() => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/alpha",
              labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "alpha" }
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();
    });

    it("updates the service tree", () => {
      expect(DCOSStore.serviceTree.getItems()[0].get("bar")).toBeUndefined();

      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [{ id: "alpha-id", name: "alpha", bar: "baz" }]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();

      expect(DCOSStore.serviceTree.getItems()[0].get("bar")).toEqual("baz");
    });

    it("does not include _itemData", () => {
      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [{ id: "alpha-id", name: "alpha", bar: "baz" }]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();

      expect(
        DCOSStore.serviceTree.getItems()[0].get()._itemData
      ).not.toBeDefined();
    });

    it("replaces old summary data", () => {
      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [{ id: "alpha-id", name: "alpha", bar: "baz" }]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();

      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [{ id: "alpha-id", name: "alpha", bar: "qux" }]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();

      expect(DCOSStore.serviceTree.getItems()[0].get("bar")).toEqual("qux");
    });

    it("does not merge Marathon data if it doesn't find a matching id", () => {
      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [{ id: "beta-id", name: "beta", foo: "bar" }]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();

      expect(DCOSStore.serviceTree.getItems()[0].get("foo")).toBeUndefined();
    });
  });

  describe("#get storeID", () => {
    it("returns 'dcos'", () => {
      expect(DCOSStore.storeID).toEqual("dcos");
    });
  });

  describe("#buildServiceTree", () => {
    it("merges data from Mesos correctly", () => {
      MarathonStore.__setKeyResponse(
        "groups",
        new ServiceTree({
          items: [
            {
              id: "/blip/cassandra",
              backoffFactor: 1.15,
              backoffSeconds: 1,
              cmd: "",
              cpus: 1,
              disk: 0,
              env: {},
              executor: "",
              fetch: [],
              healthChecks: [
                {
                  gracePeriodSeconds: 900,
                  intervalSeconds: 30,
                  maxConsecutiveFailures: 0,
                  path: "/v1/health",
                  portIndex: 0,
                  protocol: "MESOS_HTTP",
                  ipProtocol: "IPv4",
                  timeoutSeconds: 30,
                  delaySeconds: 15
                }
              ],
              instances: 1,
              labels: {
                DCOS_COMMONS_UNINSTALL: "true",
                DCOS_PACKAGE_OPTIONS: "",
                DCOS_SERVICE_SCHEME: "http",
                DCOS_PACKAGE_SOURCE: "https://universe.mesosphere.com/repo",
                DCOS_PACKAGE_METADATA: "",
                DCOS_SERVICE_NAME: "blip/cassandra",
                DCOS_PACKAGE_FRAMEWORK_NAME: "blip/cassandra",
                DCOS_SERVICE_PORT_INDEX: "0",
                DCOS_PACKAGE_DEFINITION: "",
                DCOS_PACKAGE_VERSION: "2.1.2-3.0.15-beta",
                DCOS_COMMONS_API_VERSION: "v1",
                DCOS_PACKAGE_NAME: "beta-cassandra",
                MARATHON_SINGLE_INSTANCE_APP: "true"
              },
              maxLaunchDelaySeconds: 3600,
              mem: 1024,
              gpus: 0,
              networks: [{ mode: "host" }],
              portDefinitions: [
                {
                  port: 10000,
                  labels: { VIP_0: "/api.blip/cassandra:80" },
                  name: "api",
                  protocol: "tcp"
                }
              ],
              requirePorts: false,
              upgradeStrategy: {
                maximumOverCapacity: 0,
                minimumHealthCapacity: 0
              },
              user: "nobody",
              version: "2018-07-09T15:19:39.984Z",
              versionInfo: {
                lastScalingAt: "2018-07-09T15:19:39.984Z",
                lastConfigChangeAt: "2018-07-09T15:19:39.984Z"
              },
              killSelection: "YOUNGEST_FIRST",
              unreachableStrategy: {
                inactiveAfterSeconds: 0,
                expungeAfterSeconds: 0
              },
              tasksStaged: 0,
              tasksRunning: 1,
              tasksHealthy: 1,
              tasksUnhealthy: 0,
              deployments: [],
              tasks: [],
              taskStats: {}
            }
          ]
        })
      );
      DCOSStore.onMarathonGroupsChange();

      MesosSummaryStore.__setKeyResponse(
        "states",
        new SummaryList({
          items: [
            new StateSummary({
              snapshot: {
                frameworks: [
                  {
                    id: "3f420e28-ebcf-4bdb-8521-05aafa296335-0003",
                    name: "blip/cassandra",
                    used_resources: {
                      disk: 10496,
                      mem: 4128,
                      gpus: 0,
                      cpus: 0.6,
                      ports: "[7000-7001, 7199-7199, 9042-9042]"
                    },
                    offered_resources: { disk: 0, mem: 0, gpus: 0, cpus: 0 },
                    capabilities: ["RESERVATION_REFINEMENT"],
                    hostname: "",
                    webui_url: "",
                    active: true,
                    connected: true,
                    recovered: false,
                    TASK_STAGING: 0,
                    TASK_STARTING: 0,
                    TASK_RUNNING: 1,
                    TASK_KILLING: 0,
                    TASK_FINISHED: 1,
                    TASK_KILLED: 0,
                    TASK_FAILED: 0,
                    TASK_LOST: 0,
                    TASK_ERROR: 0,
                    TASK_UNREACHABLE: 0,
                    slave_ids: ["3f420e28-ebcf-4bdb-8521-05aafa296335-S1"]
                  }
                ]
              },
              successful: true
            })
          ]
        })
      );
      DCOSStore.onMesosSummaryChange();

      const serviceTree = DCOSStore.buildServiceTree();

      expect(
        serviceTree.findItemById("/blip/cassandra").get("used_resources")
      ).toEqual({
        disk: 10496,
        mem: 4128,
        gpus: 0,
        cpus: 0.6,
        ports: "[7000-7001, 7199-7199, 9042-9042]"
      });
    });
  });

  describe("#buildFlatServiceTree", () => {
    beforeEach(function() {
      this.filterProperties = {
        id(item) {
          return item.id;
        }
      };
    });

    it("for an empty ServiceTree", function() {
      const serviceTree = new ServiceTree({
        id: "/group",
        items: [],
        filterProperties: this.filterProperties
      });

      const flatTree = DCOSStore.buildFlatServiceTree(serviceTree);
      expect(Object.keys(flatTree).length).toEqual(0);
    });

    it("for a tree with one element", function() {
      const serviceTree = new ServiceTree({
        id: "/group",
        items: [
          {
            id: "group/test",
            items: [
              {
                id: "group/test/a",
                version: "1.0",
                tasks: [
                  {
                    healthCheckResults: [{ alive: true }],
                    version: "1.0",
                    id: "bananas"
                  }
                ]
              }
            ]
          }
        ],
        filterProperties: this.filterProperties
      });

      const flatTree = DCOSStore.buildFlatServiceTree(serviceTree);
      expect(flatTree.bananas).toEqual({
        healthCheckResults: [{ alive: true }],
        version: "1.0"
      });
      expect(Object.keys(flatTree).length).toEqual(1);
    });
  });
});
