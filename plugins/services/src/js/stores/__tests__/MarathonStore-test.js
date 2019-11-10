const DeploymentsList = require("../../structs/DeploymentsList");
const EventTypes = require("../../constants/EventTypes");
const HealthTypes = require("../../constants/HealthTypes");
const MarathonStore = require("../MarathonStore");
const MockAppMetadata = require("./fixtures/MockAppMetadata");
const MockMarathonResponse = require("./fixtures/MockMarathonResponse.json");

// mock global string decoder
global.atob = () => MockAppMetadata.decodedString;

let thisHandler;

describe("MarathonStore", () => {
  describe("#getFrameworkHealth", () => {
    it("returns NA health when app has no health check", () => {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasNoHealthy.items[0]
      );
      expect(health).not.toEqual(null);
      expect(health.key).toEqual("NA");
      expect(health.value).toEqual(HealthTypes.NA);
    });

    it("returns idle when app has no running tasks", () => {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasNoRunningTasks.items[0]
      );
      expect(health.key).toEqual("IDLE");
    });

    it("returns unhealthy when app has only unhealthy tasks", () => {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasOnlyUnhealth.items[0]
      );
      expect(health.key).toEqual("UNHEALTHY");
    });

    it("returns unhealthy when app has both healthy and unhealthy tasks", () => {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasOnlyUnhealth.items[0]
      );
      expect(health.key).toEqual("UNHEALTHY");
    });

    it("returns healthy when app has healthy and no unhealthy tasks", () => {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasHealth.items[0]
      );
      expect(health.key).toEqual("HEALTHY");
    });
  });

  describe("#getServiceInstalledTime", () => {
    it("returns a dateString", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasVersion);
      const version = MarathonStore.getServiceInstalledTime("Framework 1");

      expect(!isNaN(Date.parse(version))).toEqual(true);
    });

    it("returns null when no service version", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasVersion);
      const version = MarathonStore.getServiceInstalledTime("bloop");

      expect(version).toEqual(null);
    });
  });

  describe("#getServiceVersion", () => {
    it("returns a version", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasVersion);
      const version = MarathonStore.getServiceVersion("Framework 1");

      expect(version).toEqual("0.1.0");
    });

    it("returns null when no service version", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasNoVersion);
      const version = MarathonStore.getServiceVersion("Framework 1");

      expect(version).toEqual(null);
    });
  });

  describe("#getServiceImages", () => {
    it("returns null when app is not found", () => {
      var images = MarathonStore.getServiceImages("foo");
      expect(images).toEqual(null);
    });

    it("returns an object when services are found", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasMetadata);
      var images = MarathonStore.getServiceImages("Framework 1");
      expect(images).toEqual(jasmine.any(Object));
    });

    it("returns three sizes of images when services are found", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasMetadata);
      var images = MarathonStore.getServiceImages("Framework 1");
      var keys = Object.keys(images);
      expect(keys).toContain("icon-large");
      expect(keys).toContain("icon-medium");
      expect(keys).toContain("icon-small");
    });
  });

  describe("#processMarathonGroups", () => {
    it("sets Marathon health to idle with no items", () => {
      MarathonStore.processMarathonGroups({ items: [] });
      var marathonApps = MarathonStore.get("apps");
      expect(marathonApps.marathon.health.key).toEqual("IDLE");
    });

    it("sets Marathon health to healthy with some apps", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasOnlyUnhealth);
      var marathonApps = MarathonStore.get("apps");
      expect(marathonApps.marathon.health.key).toEqual("HEALTHY");
    });

    it("has apps with NA health if apps have no health checks", () => {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasNoHealthy);
      var marathonApps = MarathonStore.get("apps");

      Object.keys(marathonApps).forEach(key => {
        var appHealth = marathonApps[key].health;

        if (key === "marathon") {
          // The marathon app should still be healthy
          expect(appHealth.key).toEqual("HEALTHY");
        } else {
          expect(appHealth.key).toEqual("NA");
          expect(appHealth.value).toEqual(HealthTypes.NA);
        }
      });
    });
  });

  describe("#processMarathonDeployments", () => {
    beforeEach(() => {
      thisHandler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_DEPLOYMENTS_CHANGE, thisHandler);
      MarathonStore.processMarathonDeployments([{ id: "deployment-id" }]);
    });

    it("holds the supplied deployments data on the store", () => {
      var deployments = MarathonStore.get("deployments");
      expect(deployments).toEqual(jasmine.any(DeploymentsList));
      expect(deployments.last().getId()).toEqual("deployment-id");
    });

    it("emits a marathon deployment event", () => {
      expect(thisHandler).toBeCalled();
    });

    it("emits a populated DeploymentsList", () => {
      const deployments = thisHandler.mock.calls[0][0];
      expect(deployments).toEqual(jasmine.any(DeploymentsList));
      expect(deployments.last().getId()).toEqual("deployment-id");
    });

    it("emits an error if the data is not an array", () => {
      thisHandler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_DEPLOYMENTS_ERROR, thisHandler);
      MarathonStore.processMarathonDeployments({ id: "deployment-id" });
      expect(thisHandler).toBeCalled();
    });
  });

  describe("#processMarathonInfoRequest", () => {
    beforeEach(() => {
      thisHandler = jest.genMockFunction();
      MarathonStore.once(
        EventTypes.MARATHON_INSTANCE_INFO_SUCCESS,
        thisHandler
      );
      MarathonStore.processMarathonInfoRequest({ foo: "bar" });
    });

    it("emits an event", () => {
      expect(thisHandler).toBeCalled();
    });

    it("returns stored info", () => {
      expect(MarathonStore.getInstanceInfo()).toEqual({ foo: "bar" });
    });
  });

  describe("#processMarathonQueue", () => {
    beforeEach(() => {
      thisHandler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_QUEUE_CHANGE, thisHandler);
      MarathonStore.processMarathonQueue({
        queue: [
          {
            app: { id: "/service-id" },
            delay: { overdue: false }
          }
        ]
      });
    });

    it("emits a marathon queue event", () => {
      expect(thisHandler).toBeCalled();
    });

    it("emits a launch queue", () => {
      const queue = thisHandler.mock.calls[0][0];
      expect(queue).toEqual(jasmine.any(Object));
      expect(queue[0].app.id).toEqual("/service-id");
    });
  });

  describe("#processMarathonServiceVersion", () => {
    it("emits correct event", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSION_CHANGE, handler);
      MarathonStore.processMarathonServiceVersion({
        serviceID: "service-id",
        versionID: "version-id",
        version: {}
      });

      expect(handler).toBeCalled();
    });

    it("passes correct service id", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSION_CHANGE, handler);
      MarathonStore.processMarathonServiceVersion({
        serviceID: "service-id",
        versionID: "version-id",
        version: {}
      });
      const { serviceID } = handler.mock.calls[0][0];

      expect(serviceID).toBe("service-id");
    });

    it("passes correct version id", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSION_CHANGE, handler);
      MarathonStore.processMarathonServiceVersion({
        serviceID: "service-id",
        versionID: "version-id",
        version: {}
      });
      const { versionID } = handler.mock.calls[0][0];

      expect(versionID).toBe("version-id");
    });
  });

  describe("#processMarathonServiceVersions", () => {
    it("emits correct event", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSIONS_CHANGE, handler);
      MarathonStore.processMarathonServiceVersions({
        serviceID: "service-id",
        versions: []
      });

      expect(handler).toBeCalled();
    });

    it("converts versions list to Map", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSIONS_CHANGE, handler);
      MarathonStore.processMarathonServiceVersions({
        serviceID: "service-id",
        versions: ["2016-05-02T16:07:32.583Z"]
      });
      const { versions } = handler.mock.calls[0][0];

      expect(versions instanceof Map).toBe(true);
      expect(versions.has("2016-05-02T16:07:32.583Z")).toBe(true);
    });

    it("passes correct service id", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSIONS_CHANGE, handler);
      MarathonStore.processMarathonServiceVersions({
        serviceID: "service-id",
        versions: ["2016-05-02T16:07:32.583Z"]
      });
      const { serviceID } = handler.mock.calls[0][0];

      expect(serviceID).toBe("service-id");
    });
  });

  describe("processMarathonDeploymentRollback", () => {
    it("deletes the relevant deployment from the store", () => {
      MarathonStore.processMarathonDeployments([{ id: "deployment-id" }]);
      MarathonStore.processMarathonDeploymentRollback({
        originalDeploymentID: "deployment-id"
      });
      expect(MarathonStore.get("deployments").getItems().length).toEqual(0);
    });

    it("emits a deployments change event", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_DEPLOYMENTS_CHANGE, handler);
      MarathonStore.processMarathonDeploymentRollback({
        originalDeploymentID: "deployment-id"
      });
      expect(handler).toBeCalled();
    });

    it("emits a rollback success event", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(
        EventTypes.MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
        handler
      );
      MarathonStore.processMarathonDeploymentRollback({
        originalDeploymentID: "deployment-id"
      });
      expect(handler).toBeCalledWith({
        originalDeploymentID: "deployment-id"
      });
    });
  });

  describe("processMarathonDeploymentRollbackError", () => {
    it("emits a rollback error event", () => {
      const handler = jest.genMockFunction();
      MarathonStore.once(
        EventTypes.MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
        handler
      );
      MarathonStore.processMarathonDeploymentRollbackError({
        originalDeploymentID: "deployment-id",
        error: "Guru meditation"
      });
      expect(handler).toBeCalledWith({
        originalDeploymentID: "deployment-id",
        error: "Guru meditation"
      });
    });
  });

  describe("#get storeID", () => {
    it("returns marathon", () => {
      expect(MarathonStore.storeID).toBe("marathon");
    });
  });
});
