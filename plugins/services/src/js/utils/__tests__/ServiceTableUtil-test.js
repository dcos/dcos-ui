const Application = require("../../structs/Application");
const Framework = require("../../structs/Framework");
const ServiceTableUtil = require("../ServiceTableUtil");

let thisCompareFunction;

describe("ServiceTableUtil", function() {
  const healthyService = new Application({
    id: "/healthy-service",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 2,
    gpus: 2,
    mem: 2048,
    disk: 10,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0,
    version: "2018-09-13T21:42:41.611Z"
  });

  const unhealthyService = new Application({
    id: "/unhealthy-service",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    gpus: 1,
    mem: 1024,
    disk: 0,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 0,
    tasksUnhealthy: 1
  });

  const higherVersionService = new Framework({
    id: "/versioned-service",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    gpus: 1,
    mem: 1024,
    disk: 0,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 1,
    tasksUnhealthy: 0,
    labels: {
      DCOS_PACKAGE_VERSION: "2.3.0-3.0.16"
    }
  });

  const lowerVersionService = new Framework({
    id: "/versioned-service-2",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    gpus: 1,
    mem: 1024,
    disk: 0,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 1,
    tasksUnhealthy: 0,
    labels: {
      DCOS_PACKAGE_VERSION: "2.3.0-1.1.0"
    }
  });

  const nonSemverVersionService = new Framework({
    id: "/versioned-service-3",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    gpus: 1,
    mem: 1024,
    disk: 0,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 1,
    tasksUnhealthy: 0,
    labels: {
      DCOS_PACKAGE_VERSION: "not-semver-beta"
    }
  });

  const stoppedService = new Application({
    id: "/stopped-service",
    instances: 0,
    tasksRunning: 0
  });

  describe("#sortData", function() {
    beforeEach(function() {
      thisCompareFunction = ServiceTableUtil.sortData;
    });

    describe("compare item name", function() {
      it("returns healthy-service first when sorting in ascending order", function() {
        expect(
          thisCompareFunction([healthyService, unhealthyService], "ASC", "name")
        ).toEqual([healthyService, unhealthyService]);
      });

      it("returns unhealthy-service first when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, unhealthyService],
            "DESC",
            "name"
          )
        ).toEqual([unhealthyService, healthyService]);
      });
    });

    describe("compare item tasks", function() {
      it("returns unhealthy first if it has less tasks when sorting in ascending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, unhealthyService],
            "ASC",
            "tasks"
          )
        ).toEqual([unhealthyService, healthyService]);
      });

      it("returns healthy first if it has more tasks when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, unhealthyService],
            "DESC",
            "tasks"
          )
        ).toEqual([healthyService, unhealthyService]);
      });
    });

    describe("compare item status", function() {
      it("returns stopped first if it has lower status when sorting in ascending order", function() {
        expect(
          thisCompareFunction([healthyService, stoppedService], "ASC", "status")
        ).toEqual([stoppedService, healthyService]);
      });

      it("returns healthy first if it has higher status when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, stoppedService],
            "DESC",
            "status"
          )
        ).toEqual([healthyService, stoppedService]);
      });
    });

    describe("compare item cpus", function() {
      it("returns unhealthy first if it has lower cpu usage when sorting in ascending order", function() {
        expect(
          thisCompareFunction([healthyService, unhealthyService], "ASC", "cpus")
        ).toEqual([unhealthyService, healthyService]);
      });

      it("returns healthy first if it has higher cpu usage when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, unhealthyService],
            "DESC",
            "cpus"
          )
        ).toEqual([healthyService, unhealthyService]);
      });
    });

    describe("compare item gpus", function() {
      it("returns unhealthy first if it has lower gpu usage when sorting in ascending order", function() {
        expect(
          thisCompareFunction([healthyService, unhealthyService], "ASC", "gpus")
        ).toEqual([unhealthyService, healthyService]);
      });

      it("returns healthy first if it has higher gpu usage when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, unhealthyService],
            "DESC",
            "gpus"
          )
        ).toEqual([healthyService, unhealthyService]);
      });
    });

    describe("compare item mem", function() {
      it("returns unhealthy first if it has lower mem usage when sorting in ascending order", function() {
        expect(
          thisCompareFunction([healthyService, unhealthyService], "ASC", "mem")
        ).toEqual([unhealthyService, healthyService]);
      });

      it("returns healthy first if it has higher mem usage when sorting in descending order", function() {
        expect(
          thisCompareFunction([healthyService, unhealthyService], "DESC", "mem")
        ).toEqual([healthyService, unhealthyService]);
      });
    });

    describe("compare item disk", function() {
      it("returns unhealthy first if it has lower disk usage when sorting in ascending order", function() {
        expect(
          thisCompareFunction([healthyService, unhealthyService], "ASC", "disk")
        ).toEqual([unhealthyService, healthyService]);
      });

      it("returns healthy first if it has higher disk usage when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, unhealthyService],
            "DESC",
            "disk"
          )
        ).toEqual([healthyService, unhealthyService]);
      });
    });

    describe("compare item version", function() {
      it("returns lowerVersionService first if it has lower version when sorting in ascending order", function() {
        expect(
          thisCompareFunction(
            [higherVersionService, lowerVersionService],
            "ASC",
            "version"
          )
        ).toEqual([lowerVersionService, higherVersionService]);
      });

      it("returns higherVersionService first if it has higher version when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [higherVersionService, lowerVersionService],
            "DESC",
            "version"
          )
        ).toEqual([higherVersionService, lowerVersionService]);
      });

      it("returns healthyService first if it has no version when sorting in ascending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, lowerVersionService],
            "ASC",
            "version"
          )
        ).toEqual([healthyService, lowerVersionService]);
      });

      it("returns lowerVersionService first if it has version when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [healthyService, lowerVersionService],
            "DESC",
            "version"
          )
        ).toEqual([lowerVersionService, healthyService]);
      });

      it("returns nonSemverVersionService first if it has non semver version when sorting in ascending order", function() {
        expect(
          thisCompareFunction(
            [nonSemverVersionService, lowerVersionService],
            "ASC",
            "version"
          )
        ).toEqual([nonSemverVersionService, lowerVersionService]);
      });

      it("returns lowerVersionService first if it has semver version when sorting in descending order", function() {
        expect(
          thisCompareFunction(
            [nonSemverVersionService, lowerVersionService],
            "DESC",
            "version"
          )
        ).toEqual([lowerVersionService, nonSemverVersionService]);
      });
    });
  });

  describe("#getFormattedVersion", function() {
    it("returns correctly formatted rawVersion and displayVersion", function() {
      expect(ServiceTableUtil.getFormattedVersion(lowerVersionService)).toEqual(
        {
          rawVersion: "2.3.0-1.1.0",
          displayVersion: "1.1.0"
        }
      );
    });

    it("returns empty displayVersion for service with no version label", function() {
      expect(ServiceTableUtil.getFormattedVersion(healthyService)).toEqual({
        rawVersion: "2018-09-13T21:42:41.611Z",
        displayVersion: ""
      });
    });
  });
});
