jest.dontMock('../../constants/HealthSorting');
jest.dontMock('../TaskTableUtil');

const Service = require('../../structs/Service');
const TaskTableUtil = require('../TaskTableUtil');
const HealthSorting = require('../../constants/HealthSorting');

describe('TaskTableUtil', function () {
  beforeEach(function () {
    this.foo = {
      name: 'foo',
      statuses: [{timestamp: 1}, {timestamp: 2}],
      updated: 0,
      resources: {
        cpus: 100,
        mem: [{value: 2}, {value: 3}]
      }
    };
    this.bar = {
      name: 'bar',
      statuses: [{timestamp: 4}],
      updated: 1,
      resources: {
        cpus: 5,
        mem: [{value: 0}, {value: 1}]
      }
    };

    this.fooStruct = new Service({
      name: 'fooStruct',
      statuses: [{timestamp: 1}, {timestamp: 2}],
      updated: 0,
      used_resources: {
        cpus: 100,
        mem: [{value: 2}, {value: 3}]
      }
    });
    this.barStruct = new Service({
      name: 'barStruct',
      statuses: [{timestamp: 4}],
      updated: 1,
      used_resources: {
        cpus: 5,
        mem: [{value: 0}, {value: 1}]
      }
    });

    this.tasks = [{
      'id': 'task-healthy.111',
      'name': 'task-healthy',
      'state': 'TASK_RUNNING',
      'health': 'Healthy'
    },
    {
      'id': 'task-unhealthy.222',
      'name': 'task-unhealthy',
      'state': 'TASK_STAGING',
      'health': 'Unhealthy'
    }];

    this.getComparator = TaskTableUtil.getSortFunction('name');
  });

  describe('#getHealthValueByName', function () {
    it('should get default health (NA) value when param is not number', function () {
      expect(TaskTableUtil.getHealthValueByName('invalid')).toEqual(HealthSorting.NA);
    });

    it('should get health value by type/name', function () {
      expect(TaskTableUtil.getHealthValueByName('Healthy')).toEqual(HealthSorting.HEALTHY);
    });
  });

  describe('#sortHealthValues', function () {
    it('should order health status by most important visible', function () {
      const expectedOrder = [{
        'id': 'task-unhealthy.222',
        'name': 'task-unhealthy',
        'state': 'TASK_STAGING',
        'health': 'Unhealthy'
      },
      {
        'id': 'task-healthy.111',
        'name': 'task-healthy',
        'state': 'TASK_RUNNING',
        'health': 'Healthy'
      }];
      const sortingResult = this.tasks.sort(TaskTableUtil.sortHealthValues);

      expect(sortingResult).toEqual(expectedOrder);
    });
  });

  describe('#getSortFunction for regular items', function () {
    it('should return a function', function () {
      expect(typeof this.getComparator).toEqual('function');
    });

    it('should compare the most recent timestamps when prop is updated', function () {
      var compareFunction = this.getComparator('updated');
      expect(compareFunction(this.foo, this.bar)).toEqual(-1);
    });

    it('should compare tieBreaker values', function () {
      var compareFunction = this.getComparator('name');

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(compareFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should compare resource values', function () {
      var compareFunction = this.getComparator('cpus');
      expect(compareFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should compare last resource values', function () {
      var compareFunction = this.getComparator('mem');
      expect(compareFunction(this.foo, this.bar)).toEqual(1);
    });
  });

  describe('#getSortFunction for structs', function () {
    it('should compare the most recent timestamps when prop is updated', function () {
      var compareFunction = this.getComparator('updated');
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(-1);
    });

    it('should compare tieBreaker values', function () {
      var compareFunction = this.getComparator('name');

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });

    it('should compare resource values', function () {
      var compareFunction = this.getComparator('cpus');
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });

    it('should compare last resource values', function () {
      var compareFunction = this.getComparator('mem');
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });
  });
});
