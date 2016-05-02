jest.dontMock('../../constants/HealthSorting');
jest.dontMock('../ResourceTableUtil');

var MarathonStore = require('../../stores/MarathonStore');
var ResourceTableUtil = require('../ResourceTableUtil');
var Service = require('../../structs/Service');

describe('ResourceTableUtil', function () {
  beforeEach(function () {
    this.getServiceHealth = MarathonStore.getServiceHealth;
    MarathonStore.getServiceHealth = function (prop) {
      return this[prop].get('health');
    }.bind(this);

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
      health: {key: 'UNHEALTHY'},
      used_resources: {
        cpus: 100,
        mem: [{value: 2}, {value: 3}]
      }
    });
    this.barStruct = new Service({
      name: 'barStruct',
      statuses: [{timestamp: 4}],
      updated: 1,
      health: {key: 'HEALTHY'},
      used_resources: {
        cpus: 5,
        mem: [{value: 0}, {value: 1}]
      }
    });

    this.sortFunction = ResourceTableUtil.getSortFunction('name');
  });

  afterEach(function () {
    MarathonStore.getServiceHealth = this.getServiceHealth;
  });

  describe('#getSortFunction for regular items', function () {
    it('should return a function', function () {
      expect(typeof this.sortFunction).toEqual('function');
    });

    it('should compare the most recent timestamps when prop is updated',
      function () {
        var sortFunction = this.sortFunction('updated');
        expect(sortFunction(this.foo, this.bar)).toEqual(-1);
      }
    );

    it('should compare tieBreaker values', function () {
      var sortFunction = this.sortFunction('name');

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(sortFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should compare resource values', function () {
      var sortFunction = this.sortFunction('cpus');
      expect(sortFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should compare last resource values', function () {
      var sortFunction = this.sortFunction('mem');
      expect(sortFunction(this.foo, this.bar)).toEqual(1);
    });
  });

  describe('#getSortFunction for structs', function () {

    it('should compare the most recent timestamps when prop is updated',
      function () {
        var sortFunction = this.sortFunction('updated');
        expect(sortFunction(this.fooStruct, this.barStruct)).toEqual(-1);
      }
    );

    it('should compare tieBreaker values', function () {
      var sortFunction = this.sortFunction('name');

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(sortFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });

    it('should compare the health correctly', function () {
      var sortFunction = this.sortFunction('health');
      expect(sortFunction(this.fooStruct, this.barStruct)).toEqual(-1);
    });

    it('should use the tieBreaker if health is the same', function () {
      var prevHealth = this.barStruct.get('health').key;
      this.barStruct.get('health').key = this.fooStruct.get('health').key;
      var sortFunction = this.sortFunction('health');

      // Will compare with names now: 'foo' > 'bar' which will return 1
      expect(sortFunction(this.fooStruct, this.barStruct)).toEqual(1);

      // Set it back to original health
      this.barStruct.get('health').key = prevHealth;
    });

    it('should compare resource values', function () {
      var sortFunction = this.sortFunction('cpus');
      expect(sortFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });

    it('should compare last resource values', function () {
      var sortFunction = this.sortFunction('mem');
      expect(sortFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });
  });
});
