const DeploymentsList = require("../../structs/DeploymentsList");
const EventTypes = require("../../constants/EventTypes");
const HealthLabels = require("../../constants/HealthLabels");
const HealthTypes = require("../../constants/HealthTypes");
const MarathonStore = require("../MarathonStore");
const MockAppMetadata = require("./fixtures/MockAppMetadata");
const MockMarathonResponse = require("./fixtures/MockMarathonResponse.json");

// mock global string decoder
global.atob = function() {
  return MockAppMetadata.decodedString;
};

let thisHandler;

describe("MarathonStore", function() {
  describe("#getFrameworkHealth", function() {
    it("returns NA health when app has no health check", function() {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasNoHealthy.items[0]
      );
      expect(health).not.toEqual(null);
      expect(health.key).toEqual("NA");
      expect(health.value).toEqual(HealthTypes.NA);
    });

    it("returns idle when app has no running tasks", function() {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasNoRunningTasks.items[0]
      );
      expect(health.key).toEqual("IDLE");
    });

    it("returns unhealthy when app has only unhealthy tasks", function() {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasOnlyUnhealth.items[0]
      );
      expect(health.key).toEqual("UNHEALTHY");
    });

    it("returns unhealthy when app has both healthy and unhealthy tasks", function() {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasOnlyUnhealth.items[0]
      );
      expect(health.key).toEqual("UNHEALTHY");
    });

    it("returns healthy when app has healthy and no unhealthy tasks", function() {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasHealth.items[0]
      );
      expect(health.key).toEqual("HEALTHY");
    });
  });

  describe("#getServiceHealth", function() {
    it("returns NA when health is not available", function() {
      var health = MarathonStore.getServiceHealth("foo");
      expect(HealthLabels[health.key]).toEqual(HealthLabels.NA);
    });

    it("returns health for service", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasHealth);
      var health = MarathonStore.getServiceHealth("Framework 1");
      expect(HealthLabels[health.key]).toEqual(HealthLabels.HEALTHY);
    });
  });

  describe("#getServiceInstalledTime", function() {
    it("returns a dateString", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasVersion);
      const version = MarathonStore.getServiceInstalledTime("Framework 1");

      expect(!isNaN(Date.parse(version))).toEqual(true);
    });

    it("returns null when no service version", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasVersion);
      const version = MarathonStore.getServiceInstalledTime("bloop");

      expect(version).toEqual(null);
    });
  });

  describe("#getServiceVersion", function() {
    it("returns a version", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasVersion);
      const version = MarathonStore.getServiceVersion("Framework 1");

      expect(version).toEqual("0.1.0");
    });

    it("returns null when no service version", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasNoVersion);
      const version = MarathonStore.getServiceVersion("Framework 1");

      expect(version).toEqual(null);
    });
  });

  describe("#getServiceImages", function() {
    it("returns null when app is not found", function() {
      var images = MarathonStore.getServiceImages("foo");
      expect(images).toEqual(null);
    });

    it("returns an object when services are found", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasMetadata);
      var images = MarathonStore.getServiceImages("Framework 1");
      expect(images).toEqual(jasmine.any(Object));
    });

    it("returns three sizes of images when services are found", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasMetadata);
      var images = MarathonStore.getServiceImages("Framework 1");
      var keys = Object.keys(images);
      expect(keys).toContain("icon-large");
      expect(keys).toContain("icon-medium");
      expect(keys).toContain("icon-small");
    });
  });

  describe("#processMarathonGroups", function() {
    it("sets Marathon health to idle with no items", function() {
      MarathonStore.processMarathonGroups({ items: [] });
      var marathonApps = MarathonStore.get("apps");
      expect(marathonApps.marathon.health.key).toEqual("IDLE");
    });

    it("sets Marathon health to healthy with some apps", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasOnlyUnhealth);
      var marathonApps = MarathonStore.get("apps");
      expect(marathonApps.marathon.health.key).toEqual("HEALTHY");
    });

    it("has apps with NA health if apps have no health checks", function() {
      MarathonStore.processMarathonGroups(MockMarathonResponse.hasNoHealthy);
      var marathonApps = MarathonStore.get("apps");

      Object.keys(marathonApps).forEach(function(key) {
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

  describe("#processMarathonDeployments", function() {
    beforeEach(function() {
      thisHandler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_DEPLOYMENTS_CHANGE, thisHandler);
      MarathonStore.processMarathonDeployments([{ id: "deployment-id" }]);
    });

    it("holds the supplied deployments data on the store", function() {
      var deployments = MarathonStore.get("deployments");
      expect(deployments).toEqual(jasmine.any(DeploymentsList));
      expect(deployments.last().getId()).toEqual("deployment-id");
    });

    it("emits a marathon deployment event", function() {
      expect(thisHandler).toBeCalled();
    });

    it("emits a populated DeploymentsList", function() {
      const deployments = thisHandler.mock.calls[0][0];
      expect(deployments).toEqual(jasmine.any(DeploymentsList));
      expect(deployments.last().getId()).toEqual("deployment-id");
    });
  });

  describe("#processMarathonInfoRequest", function() {
    beforeEach(function() {
      thisHandler = jest.genMockFunction();
      MarathonStore.once(
        EventTypes.MARATHON_INSTANCE_INFO_SUCCESS,
        thisHandler
      );
      MarathonStore.processMarathonInfoRequest({ foo: "bar" });
    });

    it("emits an event", function() {
      expect(thisHandler).toBeCalled();
    });

    it("returns stored info", function() {
      expect(MarathonStore.getInstanceInfo()).toEqual({ foo: "bar" });
    });
  });

  describe("#processMarathonQueue", function() {
    beforeEach(function() {
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

    it("emits a marathon queue event", function() {
      expect(thisHandler).toBeCalled();
    });

    it("emits a launch queue", function() {
      const queue = thisHandler.mock.calls[0][0];
      expect(queue).toEqual(jasmine.any(Object));
      expect(queue[0].app.id).toEqual("/service-id");
    });
  });

  describe("#processMarathonServiceVersion", function() {
    it("emits correct event", function() {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSION_CHANGE, handler);
      MarathonStore.processMarathonServiceVersion({
        serviceID: "service-id",
        versionID: "version-id",
        version: {}
      });

      expect(handler).toBeCalled();
    });

    it("passes correct service id", function() {
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

    it("passes correct version id", function() {
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

  describe("#processMarathonServiceVersions", function() {
    it("emits correct event", function() {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_SERVICE_VERSIONS_CHANGE, handler);
      MarathonStore.processMarathonServiceVersions({
        serviceID: "service-id",
        versions: []
      });

      expect(handler).toBeCalled();
    });

    it("converts versions list to Map", function() {
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

    it("passes correct service id", function() {
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

  describe("processMarathonDeploymentRollback", function() {
    it("deletes the relevant deployment from the store", function() {
      MarathonStore.processMarathonDeployments([{ id: "deployment-id" }]);
      MarathonStore.processMarathonDeploymentRollback({
        originalDeploymentID: "deployment-id"
      });
      expect(MarathonStore.get("deployments").getItems().length).toEqual(0);
    });

    it("emits a deployments change event", function() {
      const handler = jest.genMockFunction();
      MarathonStore.once(EventTypes.MARATHON_DEPLOYMENTS_CHANGE, handler);
      MarathonStore.processMarathonDeploymentRollback({
        originalDeploymentID: "deployment-id"
      });
      expect(handler).toBeCalled();
    });

    it("emits a rollback success event", function() {
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

  describe("processMarathonDeploymentRollbackError", function() {
    it("emits a rollback error event", function() {
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

  describe("#get storeID", function() {
    it("returns marathon", function() {
      expect(MarathonStore.storeID).toBe("marathon");
    });
  });
});
