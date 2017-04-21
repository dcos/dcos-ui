jest.dontMock("../TaskTableUtil");

const Service = require("../../structs/Service");
const TaskTableUtil = require("../TaskTableUtil");

describe("TaskTableUtil", function() {
  beforeEach(function() {
    this.foo = {
      name: "foo",
      statuses: [{ timestamp: 1 }, { timestamp: 2 }],
      updated: 0,
      resources: {
        cpus: 100,
        mem: [{ value: 2 }, { value: 3 }]
      }
    };
    this.bar = {
      name: "bar",
      statuses: [{ timestamp: 4 }],
      updated: 1,
      resources: {
        cpus: 5,
        mem: [{ value: 0 }, { value: 1 }]
      }
    };

    this.fooStruct = new Service({
      name: "fooStruct",
      statuses: [{ timestamp: 1 }, { timestamp: 2 }],
      updated: 0,
      used_resources: {
        cpus: 100,
        mem: [{ value: 2 }, { value: 3 }]
      }
    });
    this.barStruct = new Service({
      name: "barStruct",
      statuses: [{ timestamp: 4 }],
      updated: 1,
      used_resources: {
        cpus: 5,
        mem: [{ value: 0 }, { value: 1 }]
      }
    });

    this.getComparator = TaskTableUtil.getSortFunction("name");
  });

  describe("#getSortFunction for regular items", function() {
    it("should return a function", function() {
      expect(typeof this.getComparator).toEqual("function");
    });

    it("should compare the most recent timestamps when prop is updated", function() {
      var compareFunction = this.getComparator("updated");
      expect(compareFunction(this.foo, this.bar)).toEqual(-1);
    });

    it("should compare tieBreaker values", function() {
      var compareFunction = this.getComparator("name");

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(compareFunction(this.foo, this.bar)).toEqual(1);
    });

    it("should compare resource values", function() {
      var compareFunction = this.getComparator("cpus");
      expect(compareFunction(this.foo, this.bar)).toEqual(1);
    });

    it("should compare last resource values", function() {
      var compareFunction = this.getComparator("mem");
      expect(compareFunction(this.foo, this.bar)).toEqual(1);
    });
  });

  describe("#getSortFunction for structs", function() {
    it("should compare the most recent timestamps when prop is updated", function() {
      var compareFunction = this.getComparator("updated");
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(-1);
    });

    it("should compare tieBreaker values", function() {
      var compareFunction = this.getComparator("name");

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });

    it("should compare resource values", function() {
      var compareFunction = this.getComparator("cpus");
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });

    it("should compare last resource values", function() {
      var compareFunction = this.getComparator("mem");
      expect(compareFunction(this.fooStruct, this.barStruct)).toEqual(1);
    });
  });
});
