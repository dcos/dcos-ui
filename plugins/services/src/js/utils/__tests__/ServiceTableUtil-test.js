const Application = require("../../structs/Application");
const Framework = require("../../structs/Framework");
const ServiceTableUtil = require("../ServiceTableUtil");
const ServiceTree = require("../../structs/ServiceTree");

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

  const recoveringService = new Application({
    id: "/recovering-service",
    queue: true,
    deployments: null
  });

  const serviceTree = new ServiceTree({
    id: "/tree",
    items: []
  });

  describe("#propCompareFunctionFactory", function() {
    describe("compare item types", function() {
      describe("sort ascending", function() {
        beforeEach(function() {
          thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
            "name",
            "asc"
          );
        });

        it("returns -1 if type a comes beforeEach type b", function() {
          expect(thisCompareFunction(serviceTree, healthyService)).toEqual(-1);
        });

        it("returns 0 if type a is equal to type b", function() {
          expect(thisCompareFunction(serviceTree, serviceTree)).toEqual(0);
        });

        it("returns 1 if type a comes after type b", function() {
          expect(thisCompareFunction(healthyService, serviceTree)).toEqual(1);
        });
      });

      describe("sort descending", function() {
        beforeEach(function() {
          thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
            "name",
            "desc"
          );
        });

        it("returns 1 if type a comes beforeEach type b", function() {
          expect(thisCompareFunction(serviceTree, healthyService)).toEqual(1);
        });

        it("returns 0 if type a is equal to type b", function() {
          expect(thisCompareFunction(serviceTree, serviceTree)).toEqual(0);
        });

        it("returns -1 if type a comes after type b", function() {
          expect(thisCompareFunction(healthyService, serviceTree)).toEqual(-1);
        });
      });
    });

    describe("compare item name", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "name",
          "asc"
        );
      });

      it("returns 1 if type a comes beforeEach type b", function() {
        expect(thisCompareFunction(serviceTree, healthyService)).toEqual(-1);
      });

      it("returns 0 if type a is equal to type b", function() {
        expect(thisCompareFunction(serviceTree, serviceTree)).toEqual(0);
      });

      it("returns -1 if type a comes after type b", function() {
        expect(thisCompareFunction(healthyService, serviceTree)).toEqual(1);
      });
    });

    describe("compare item tasks", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "tasks",
          "asc"
        );
      });

      it("returns 1 if a has more running tasks than b", function() {
        expect(thisCompareFunction(healthyService, unhealthyService)).toEqual(
          1
        );
      });

      it("returns 0 if a has same number of running tasks as b", function() {
        expect(thisCompareFunction(healthyService, healthyService)).toEqual(0);
      });

      it("returns -1 if a has less running tasks than b", function() {
        expect(thisCompareFunction(unhealthyService, healthyService)).toEqual(
          -1
        );
      });
    });

    describe("compare item status", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "status",
          "asc"
        );
      });

      it("returns 1 if a comes after b in the status sorting", function() {
        expect(thisCompareFunction(healthyService, stoppedService)).toEqual(1);
      });

      it("returns 0 if a has the same status as b", function() {
        expect(thisCompareFunction(healthyService, healthyService)).toEqual(0);
      });

      it("returns -1 if a comes beforeEach b in the status sorting", function() {
        expect(thisCompareFunction(recoveringService, stoppedService)).toEqual(
          -1
        );
      });
    });

    describe("compare item cpus", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "cpus"
        );
      });

      it("returns 1 if a has more cpus than b", function() {
        expect(thisCompareFunction(healthyService, unhealthyService)).toEqual(
          1
        );
      });

      it("returns 0 if a has same number of cpus as b", function() {
        expect(thisCompareFunction(healthyService, healthyService)).toEqual(0);
      });

      it("returns -1 if a has less cpus than b", function() {
        expect(thisCompareFunction(unhealthyService, healthyService)).toEqual(
          -1
        );
      });
    });

    describe("compare item gpus", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "gpus"
        );
      });

      it("returns 1 if a has more gpus than b", function() {
        expect(thisCompareFunction(healthyService, unhealthyService)).toEqual(
          1
        );
      });

      it("returns 0 if a has same number of gpus as b", function() {
        expect(thisCompareFunction(healthyService, healthyService)).toEqual(0);
      });

      it("returns -1 if a has less gpus than b", function() {
        expect(thisCompareFunction(unhealthyService, healthyService)).toEqual(
          -1
        );
      });
    });

    describe("compare item mem", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "mem"
        );
      });

      it("returns 1 if a has more mem than b", function() {
        expect(thisCompareFunction(healthyService, unhealthyService)).toEqual(
          1
        );
      });

      it("returns 0 if a has same number of mem as b", function() {
        expect(thisCompareFunction(healthyService, healthyService)).toEqual(0);
      });

      it("returns -1 if a has less mem than b", function() {
        expect(thisCompareFunction(unhealthyService, healthyService)).toEqual(
          -1
        );
      });
    });

    describe("compare item disk", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "disk"
        );
      });

      it("returns 1 if a has more disk than b", function() {
        expect(thisCompareFunction(healthyService, unhealthyService)).toEqual(
          1
        );
      });

      it("returns 0 if a has same number of disk as b", function() {
        expect(thisCompareFunction(healthyService, healthyService)).toEqual(0);
      });

      it("returns -1 if a has less disk than b", function() {
        expect(thisCompareFunction(unhealthyService, healthyService)).toEqual(
          -1
        );
      });
    });

    describe("compare item version", function() {
      beforeEach(function() {
        thisCompareFunction = ServiceTableUtil.propCompareFunctionFactory(
          "version"
        );
      });

      it("returns 0 if a and b are both empty", function() {
        expect(thisCompareFunction(healthyService, unhealthyService)).toEqual(
          0
        );
      });

      it("returns -1 if a has lower version than b", function() {
        expect(
          thisCompareFunction(lowerVersionService, higherVersionService)
        ).toEqual(-1);
      });

      it("returns 1 if a has higher version than b", function() {
        expect(
          thisCompareFunction(higherVersionService, lowerVersionService)
        ).toEqual(1);
      });

      it("returns -1 if a has no version label", function() {
        expect(
          thisCompareFunction(healthyService, lowerVersionService)
        ).toEqual(-1);
      });

      it("returns 1 if b has no version label", function() {
        expect(
          thisCompareFunction(lowerVersionService, healthyService)
        ).toEqual(1);
      });

      it("returns -1 if a is non-semver versioned and b is semver", function() {
        expect(
          thisCompareFunction(nonSemverVersionService, lowerVersionService)
        ).toEqual(-1);
      });

      it("returns 1 if a is semver versioned and b is not", function() {
        expect(
          thisCompareFunction(lowerVersionService, nonSemverVersionService)
        ).toEqual(1);
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
