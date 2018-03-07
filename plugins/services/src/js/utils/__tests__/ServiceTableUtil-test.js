const Application = require("../../structs/Application");
const ServiceTableUtil = require("../ServiceTableUtil");
const ServiceTree = require("../../structs/ServiceTree");

let thisCompareFunction;

describe("ServiceTableUtil", function() {
  const healthyService = new Application({
    id: "/healthy-service",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 2,
    mem: 2048,
    disk: 10,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0
  });

  const unhealthyService = new Application({
    id: "/unhealthy-service",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    mem: 1024,
    disk: 0,
    instances: 2,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 0,
    tasksUnhealthy: 1
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
  });
});
