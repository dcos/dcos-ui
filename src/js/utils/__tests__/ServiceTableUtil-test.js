jest.dontMock('../ServiceTableUtil');
jest.dontMock('../../structs/Service');

var Service = require('../../structs/Service');
var ServiceTableUtil = require('../ServiceTableUtil');

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

  describe('#numberCompareFunction', function () {

    it('should return 1 if a is bigger than b', function () {
      expect(ServiceTableUtil.numberCompareFunction(5, 2)).toEqual(1);
    });

    it('should return 0 if a is equal to b', function () {
      expect(ServiceTableUtil.numberCompareFunction(3, 3)).toEqual(0);
    });

    it('should return -1 if a is smaller than b', function () {
      expect(ServiceTableUtil.numberCompareFunction(1, 4)).toEqual(-1);
    });

    it('should handle float values', function () {
      expect(ServiceTableUtil.numberCompareFunction(2, 1.001)).toEqual(1);
    });

  });

  describe('#nameCompareFunction', function () {

    it('should return 1 if name a comes before name b', function () {
      expect(
        ServiceTableUtil.nameCompareFunction(healthyService, unhealthyService)
      ).toEqual(-1);
    });

    it('should return 0 if name a is equal to name b', function () {
      expect(
        ServiceTableUtil.nameCompareFunction(healthyService, healthyService)
      ).toEqual(0);
    });

    it('should return -1 if name a comes after name b', function () {
      expect(
        ServiceTableUtil.nameCompareFunction(unhealthyService, healthyService)
      ).toEqual(1);
    });

  });

  describe('#taskCompareFunction', function () {

    it('should return 1 if a has more running tasks than b', function () {
      expect(
        ServiceTableUtil.taskCompareFunction(healthyService, unhealthyService)
      ).toEqual(1);
    });

    it('should return 0 if a has same number of running tasks as b',
      function () {
        expect(
          ServiceTableUtil.taskCompareFunction(healthyService, healthyService)
        ).toEqual(0);
      }
    );

    it('should return -1 if a has less running tasks than b', function () {
      expect(
        ServiceTableUtil.taskCompareFunction(unhealthyService, healthyService)
      ).toEqual(-1);
    });

  });

  describe('#healthCompareFunction', function () {

    it('should return 1 if a comes after b in the health sorting', function () {
      expect(
        ServiceTableUtil.healthCompareFunction(healthyService, unhealthyService)
      ).toEqual(1);
    });

    it('should return 0 if a has the same health as b', function () {
      expect(
        ServiceTableUtil.healthCompareFunction(healthyService, healthyService)
      ).toEqual(0);
    });

    it('should return -1 if a comes before b in the health sorting',
      function () {
        expect(
          ServiceTableUtil
            .healthCompareFunction(unhealthyService, healthyService)
        ).toEqual(-1);
      }
    );

  });

  describe('#cpusCompareFunction', function () {

    it('should return 1 if a has more cpus than b', function () {
      expect(
        ServiceTableUtil.cpusCompareFunction(healthyService, unhealthyService)
      ).toEqual(1);
    });

    it('should return 0 if a has same number of cpus as b',
      function () {
        expect(
          ServiceTableUtil.cpusCompareFunction(healthyService, healthyService)
        ).toEqual(0);
      }
    );

    it('should return -1 if a has less cpus than b', function () {
      expect(
        ServiceTableUtil.cpusCompareFunction(unhealthyService, healthyService)
      ).toEqual(-1);
    });

  });

  describe('#memCompareFunction', function () {

    it('should return 1 if a has more mem than b', function () {
      expect(
        ServiceTableUtil.memCompareFunction(healthyService, unhealthyService)
      ).toEqual(1);
    });

    it('should return 0 if a has same number of mem as b',
      function () {
        expect(
          ServiceTableUtil.memCompareFunction(healthyService, healthyService)
        ).toEqual(0);
      }
    );

    it('should return -1 if a has less mem than b', function () {
      expect(
        ServiceTableUtil.memCompareFunction(unhealthyService, healthyService)
      ).toEqual(-1);
    });

  });

  describe('#diskCompareFunction', function () {

    it('should return 1 if a has more disk than b', function () {
      expect(
        ServiceTableUtil.diskCompareFunction(healthyService, unhealthyService)
      ).toEqual(1);
    });

    it('should return 0 if a has same number of disk as b',
      function () {
        expect(
          ServiceTableUtil.diskCompareFunction(healthyService, healthyService)
        ).toEqual(0);
      }
    );

    it('should return -1 if a has less disk than b', function () {
      expect(
        ServiceTableUtil.diskCompareFunction(unhealthyService, healthyService)
      ).toEqual(-1);
    });

  });

});
