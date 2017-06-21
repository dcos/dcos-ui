jest.mock("../../../plugins/services/src/js/stores/MarathonStore");
jest.mock("../../../src/js/stores/MesosSummaryStore");
jest.dontMock("../DCOSStore");
jest.dontMock("../../../src/js/structs/SummaryList");
jest.dontMock("../../../src/js/structs/StateSummary");

const DCOSStore = require("../DCOSStore");
const EventTypes = require("../../../src/js/constants/EventTypes");
const MarathonStore = require("../../../plugins/services/src/js/stores/MarathonStore");
const MesosSummaryStore = require("../../../src/js/stores/MesosSummaryStore");
const NotificationStore = require("../../../src/js/stores/NotificationStore");
const DeploymentsList = require("../../../plugins/services/src/js/structs/DeploymentsList");
const ServiceTree = require("../../../plugins/services/src/js/structs/ServiceTree");
const SummaryList = require("../../../src/js/structs/SummaryList");
const StateSummary = require("../../../src/js/structs/StateSummary");

describe("DCOSStore", function() {
  beforeEach(function() {
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

  describe("#constructor", function() {
    it("should expose an empty deployments list", function() {
      expect(DCOSStore.deploymentsList.getItems().length).toEqual(0);
    });
  });

  describe("#emit", function() {
    beforeEach(function() {
      // Clean up application timers.
      jasmine.clock().uninstall();
      // Install our custom jasmine timers.
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2016, 3, 19));
    });

    it("calls arbitrary event handler directly", function() {
      const handler = jasmine.createSpy("handler");
      DCOSStore.on("direct", handler);
      DCOSStore.emit("direct");
      expect(handler).toHaveBeenCalled();
    });

    it("debounces change event handler calls", function() {
      const handler = jasmine.createSpy("handler");
      DCOSStore.on(EventTypes.DCOS_CHANGE, handler);
      DCOSStore.emit(EventTypes.DCOS_CHANGE);
      jasmine.clock().tick(250);
      expect(handler).toHaveBeenCalled();
    });

    it("debounce calls change event handler only once after consecutive calls", function() {
      const handler = jasmine.createSpy("handler");
      DCOSStore.on(EventTypes.DCOS_CHANGE, handler);
      DCOSStore.emit(EventTypes.DCOS_CHANGE);
      expect(handler).not.toHaveBeenCalled();
      DCOSStore.emit(EventTypes.DCOS_CHANGE);
      expect(handler).not.toHaveBeenCalled();
      jasmine.clock().tick(250);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("#onMarathonDeploymentsChange", function() {
    beforeEach(function() {
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

    describe("when the groups endpoint is not populated", function() {
      beforeEach(function() {
        DCOSStore.onMarathonDeploymentsChange();
      });

      it("should not update the deployments list", function() {
        expect(DCOSStore.deploymentsList.getItems().length).toEqual(0);
      });

      it("should not update the notification store", function() {
        expect(NotificationStore.addNotification).not.toHaveBeenCalled();
      });

      it("should be called as soon as groups endpoint data arrives", function() {
        spyOn(DCOSStore, "onMarathonDeploymentsChange");
        DCOSStore.onMarathonGroupsChange();
        expect(DCOSStore.onMarathonDeploymentsChange).toHaveBeenCalled();
      });
    });

    describe("when the groups endpoint is already populated", function() {
      beforeEach(function() {
        DCOSStore.onMarathonGroupsChange();
        DCOSStore.onMarathonDeploymentsChange();
      });

      it("should update the deployments list", function() {
        expect(DCOSStore.deploymentsList.getItems().length).toEqual(1);
        expect(DCOSStore.deploymentsList.last().id).toEqual("deployment-id");
      });

      it("should populate the deployments with relevant services", function() {
        const deployment = DCOSStore.deploymentsList.last();
        const services = deployment.getAffectedServices();
        expect(services.length).toEqual(2);
      });

      it("should update the notification store", function() {
        expect(NotificationStore.addNotification).toHaveBeenCalledWith(
          "services-deployments",
          "deployment-count",
          1
        );
      });
    });

    describe("when the deployments endpoint references stale services", function() {
      beforeEach(function() {
        DCOSStore.onMarathonDeploymentsChange();
        MarathonStore.__setKeyResponse("groups", new ServiceTree({ apps: [] }));
        DCOSStore.onMarathonGroupsChange();
      });

      it("should trim stale services", function() {
        const deployment = DCOSStore.deploymentsList.last();
        const services = deployment.getAffectedServices();
        expect(services.length).toEqual(0);
      });
    });
  });

  describe("#onMarathonGroupsChange", function() {
    beforeEach(function() {
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

    it("should update the service tree", function() {
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

    it("should replace old Marathon data", function() {
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

    it("should merge (matching by id) summary data", function() {
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

    it("should not merge summary data if it doesn't find a matching id", function() {
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

    it("should not include _itemData", function() {
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

  describe("#onMarathonQueueChange", function() {
    const serviceId = "/alpha";
    beforeEach(function() {
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

    it("should update the service tree", function() {
      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).toEqual(
        "Waiting"
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

    it("should correctly convert running apps from waiting state", function() {
      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).toEqual(
        "Waiting"
      );
      DCOSStore.onMarathonQueueChange([]);
      expect(DCOSStore.serviceTree.getItems()[0].getStatus()).not.toEqual(
        "Waiting"
      );
    });

    it("should not include _itemData", function() {
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

  describe("#processMarathonServiceVersion", function() {
    const versionID = "2016-03-22T10:46:07.354Z";

    beforeEach(function() {
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

    it("should update the service tree", function() {
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

    it("should not include _itemData", function() {
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

  describe("#processMarathonServiceVersions", function() {
    const firstVersionID = "2016-03-22T10:46:07.354Z";
    const secondVersionID = "2016-04-22T10:46:07.354Z";

    beforeEach(function() {
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

    it("should update the service tree", function() {
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

    it("should merge existing version data", function() {
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

    it("should not include _itemData", function() {
      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: "/beta",
        versions: new Map([[firstVersionID]])
      });

      expect(
        DCOSStore.serviceTree.getItems()[0].get()._itemData
      ).not.toBeDefined();
    });
  });

  describe("#onMesosSummaryChange", function() {
    beforeEach(function() {
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

    it("should update the service tree", function() {
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

    it("should not include _itemData", function() {
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

    it("should replace old summary data", function() {
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

    it("should not merge Marathon data if it doesn't find a matching id", function() {
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

  describe("#get storeID", function() {
    it("should return 'dcos'", function() {
      expect(DCOSStore.storeID).toEqual("dcos");
    });
  });
});
