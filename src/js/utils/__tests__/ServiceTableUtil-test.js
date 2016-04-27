jest.dontMock('../ServiceTableUtil');
jest.dontMock('../../structs/Service');

var Service = require('../../structs/Service');
var ServiceTableUtil = require('../ServiceTableUtil');
var ServiceTree = require('../../structs/ServiceTree');

describe('ServiceTableUtil', function () {

  const healthyService = new Service({
    id: '/healthy-service',
    healthChecks: [{path: '', protocol: 'HTTP'}],
    cpus: 2,
    mem: 2048,
    disk: 10,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0
  });

  const unhealthyService = new Service({
    id: '/unhealthy-service',
    healthChecks: [{path: '', protocol: 'HTTP'}],
    cpus: 1,
    mem: 1024,
    disk: 0,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 0,
    tasksUnhealthy: 1
  });

  const serviceTree = new ServiceTree({
    id: '/tree',
    items: []
  });

  describe('#propCompareFunctionFactory', function () {

    describe('compare item types', function () {

      describe('sort ascending', function () {

        beforeEach(function () {
          this.compareFunction =
            ServiceTableUtil.propCompareFunctionFactory('name', 'asc');
        });

        it('should return -1 if type a comes beforeEach type b', function () {
          expect(
            this.compareFunction(serviceTree, healthyService)
          ).toEqual(-1);
        });

        it('should return 0 if type a is equal to type b', function () {
          expect(
            this.compareFunction(serviceTree, serviceTree)
          ).toEqual(0);
        });

        it('should return 1 if type a comes after type b', function () {
          expect(
            this.compareFunction(healthyService, serviceTree)
          ).toEqual(1);
        });

      });

      describe('sort descending', function () {

        beforeEach(function () {
          this.compareFunction =
            ServiceTableUtil.propCompareFunctionFactory('name', 'desc');
        });

        it('should return 1 if type a comes beforeEach type b', function () {
          expect(
            this.compareFunction(serviceTree, healthyService)
          ).toEqual(1);
        });

        it('should return 0 if type a is equal to type b', function () {
          expect(
            this.compareFunction(serviceTree, serviceTree)
          ).toEqual(0);
        });

        it('should return -1 if type a comes after type b', function () {
          expect(
            this.compareFunction(healthyService, serviceTree)
          ).toEqual(-1);
        });

      });

    });

    describe('compare item name', function () {

      beforeEach(function () {
        this.compareFunction =
          ServiceTableUtil.propCompareFunctionFactory('name', 'asc');
      });

      it('should return 1 if type a comes beforeEach type b', function () {
        expect(
          this.compareFunction(serviceTree, healthyService)
        ).toEqual(-1);
      });

      it('should return 0 if type a is equal to type b', function () {
        expect(
          this.compareFunction(serviceTree, serviceTree)
        ).toEqual(0);
      });

      it('should return -1 if type a comes after type b', function () {
        expect(
          this.compareFunction(healthyService, serviceTree)
        ).toEqual(1);
      });

    });

    describe('compare item tasks', function () {

      beforeEach(function () {
        this.compareFunction =
          ServiceTableUtil.propCompareFunctionFactory('tasks', 'asc');
      });

      it('should return 1 if a has more running tasks than b', function () {
        expect(
          this.compareFunction(healthyService, unhealthyService)
        ).toEqual(1);
      });

      it('should return 0 if a has same number of running tasks as b',
        function () {
          expect(
            this.compareFunction(healthyService, healthyService)
          ).toEqual(0);
        }
      );

      it('should return -1 if a has less running tasks than b', function () {
        expect(
          this.compareFunction(unhealthyService, healthyService)
        ).toEqual(-1);
      });

    });

    describe('compare item health', function () {

      beforeEach(function () {
        this.compareFunction =
          ServiceTableUtil.propCompareFunctionFactory('health', 'asc');
      });

      it('should return 1 if a comes after b in the health sorting',
        function () {
          expect(
            this.compareFunction(healthyService, unhealthyService)
          ).toEqual(1);
        }
      );

      it('should return 0 if a has the same health as b', function () {
        expect(
          this.compareFunction(healthyService, healthyService)
        ).toEqual(0);
      });

      it('should return -1 if a comes beforeEach b in the health sorting',
        function () {
          expect(
            this.compareFunction(unhealthyService, healthyService)
          ).toEqual(-1);
        }
      );

    });

    describe('compare item cpus', function () {

      beforeEach(function () {
        this.compareFunction =
          ServiceTableUtil.propCompareFunctionFactory('cpus');
      });

      it('should return 1 if a has more cpus than b', function () {
        expect(
          this.compareFunction(healthyService, unhealthyService)
        ).toEqual(1);
      });

      it('should return 0 if a has same number of cpus as b',
        function () {
          expect(
            this.compareFunction(healthyService, healthyService)
          ).toEqual(0);
        }
      );

      it('should return -1 if a has less cpus than b', function () {
        expect(
          this.compareFunction(unhealthyService, healthyService)
        ).toEqual(-1);
      });

    });

    describe('compare item mem', function () {

      beforeEach(function () {
        this.compareFunction =
          ServiceTableUtil.propCompareFunctionFactory('mem');
      });

      it('should return 1 if a has more mem than b', function () {
        expect(
          this.compareFunction(healthyService, unhealthyService)
        ).toEqual(1);
      });

      it('should return 0 if a has same number of mem as b',
        function () {
          expect(
            this.compareFunction(healthyService, healthyService)
          ).toEqual(0);
        }
      );

      it('should return -1 if a has less mem than b', function () {
        expect(
          this.compareFunction(unhealthyService, healthyService)
        ).toEqual(-1);
      });

    });

    describe('compare item disk', function () {

      beforeEach(function () {
        this.compareFunction =
          ServiceTableUtil.propCompareFunctionFactory('disk');
      });

      it('should return 1 if a has more disk than b', function () {
        expect(
          this.compareFunction(healthyService, unhealthyService)
        ).toEqual(1);
      });

      it('should return 0 if a has same number of disk as b',
        function () {
          expect(
            this.compareFunction(healthyService, healthyService)
          ).toEqual(0);
        }
      );

      it('should return -1 if a has less disk than b', function () {
        expect(
          this.compareFunction(unhealthyService, healthyService)
        ).toEqual(-1);
      });

    });

  });

});
