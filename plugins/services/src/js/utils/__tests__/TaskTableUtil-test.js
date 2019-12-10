import TaskTableUtil from "../TaskTableUtil";

const Service = require("../../structs/Service");

let thisFoo, thisBar, thisFooStruct, thisBarStruct, thisGetComparator;

describe("TaskTableUtil", () => {
  beforeEach(() => {
    thisFoo = {
      name: "foo",
      statuses: [{ timestamp: 1 }, { timestamp: 2 }],
      updated: 0,
      resources: {
        cpus: 100,
        mem: [{ value: 2 }, { value: 3 }]
      }
    };
    thisBar = {
      name: "bar",
      statuses: [{ timestamp: 4 }],
      updated: 1,
      resources: {
        cpus: 5,
        mem: [{ value: 0 }, { value: 1 }]
      }
    };

    thisFooStruct = new Service({
      name: "fooStruct",
      statuses: [{ timestamp: 1 }, { timestamp: 2 }],
      updated: 0,
      used_resources: {
        cpus: 100,
        mem: [{ value: 2 }, { value: 3 }]
      }
    });
    thisBarStruct = new Service({
      name: "barStruct",
      statuses: [{ timestamp: 4 }],
      updated: 1,
      used_resources: {
        cpus: 5,
        mem: [{ value: 0 }, { value: 1 }]
      }
    });

    thisGetComparator = TaskTableUtil.getSortFunction("name");
  });

  describe("#getSortFunction for regular items", () => {
    it("returns a function", () => {
      expect(typeof thisGetComparator).toEqual("function");
    });

    it("compares the most recent timestamps when prop is updated", () => {
      var compareFunction = thisGetComparator("updated");
      expect(compareFunction(thisFoo, thisBar)).toEqual(-1);
    });

    it("compares tieBreaker values", () => {
      var compareFunction = thisGetComparator("name");

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(compareFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("compares resource values", () => {
      var compareFunction = thisGetComparator("cpus");
      expect(compareFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("compares last resource values", () => {
      var compareFunction = thisGetComparator("mem");
      expect(compareFunction(thisFoo, thisBar)).toEqual(1);
    });
  });

  describe("#getSortFunction for structs", () => {
    it("compares the most recent timestamps when prop is updated", () => {
      var compareFunction = thisGetComparator("updated");
      expect(compareFunction(thisFooStruct, thisBarStruct)).toEqual(-1);
    });

    it("compares tieBreaker values", () => {
      var compareFunction = thisGetComparator("name");

      // 'foo' > 'bar' will equal true and compareValues returns 1
      expect(compareFunction(thisFooStruct, thisBarStruct)).toEqual(1);
    });

    it("compares resource values", () => {
      var compareFunction = thisGetComparator("cpus");
      expect(compareFunction(thisFooStruct, thisBarStruct)).toEqual(1);
    });

    it("compares last resource values", () => {
      var compareFunction = thisGetComparator("mem");
      expect(compareFunction(thisFooStruct, thisBarStruct)).toEqual(1);
    });
  });
});
