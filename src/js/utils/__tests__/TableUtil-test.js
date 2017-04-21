jest.dontMock("../TableUtil");

const MarathonStore = require("../../../../plugins/services/src/js/stores/MarathonStore");
const TableUtil = require("../TableUtil");
const Util = require("../Util");
const HealthSorting = require("../../../../plugins/services/src/js/constants/HealthSorting");

describe("TableUtil", function() {
  beforeEach(function() {
    this.getServiceHealth = MarathonStore.getServiceHealth;

    this.foo = {
      equal: 0,
      id: "foo",
      name: null,
      statuses: [{ timestamp: 1 }, { timestamp: 2 }],
      version: "1.0.1"
    };
    this.bar = {
      equal: 0,
      id: "bar",
      name: "bar",
      statuses: [{ timestamp: 4 }],
      version: undefined
    };
  });

  describe("#getSortFunction", function() {
    beforeEach(function() {
      this.getProp = function(obj, prop) {
        if (prop === "timestamp") {
          return Util.last(obj.statuses)[prop];
        }

        return obj[prop];
      };

      this.sortFunction = TableUtil.getSortFunction("id", this.getProp);
    });

    it("should return a function", function() {
      expect(typeof this.sortFunction).toEqual("function");
    });

    it("should compare ids values", function() {
      var sortPropFunction = this.sortFunction("id");
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it("should handle null values", function() {
      var sortPropFunction = this.sortFunction("name");
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it("should handle undefined values", function() {
      var sortPropFunction = this.sortFunction("version");
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it("should handle nested properties through getter function", function() {
      var sortPropFunction = this.sortFunction("timestamp");
      expect(sortPropFunction(this.foo, this.bar)).toEqual(-1);
    });

    it("should use if values are equal tiebreaker", function() {
      var sortPropFunction = this.sortFunction("equal");
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it("should handle alternative tiebreaker", function() {
      var sortFunction = TableUtil.getSortFunction("timestamp", this.getProp);
      var sortPropFunction = sortFunction("equal");
      expect(sortPropFunction(this.foo, this.bar)).toEqual(-1);
    });
  });

  describe("#getHealthSortingOrder", function() {
    it("should return a function", function() {
      expect(typeof TableUtil.getHealthSortingOrder()).toEqual("function");
    });
  });

  describe("#getHealthSortingValue", function() {
    it("should return sorting value when receives string value", function() {
      const healthStatus = "Unhealthy";

      expect(TableUtil.getHealthSortingValue(healthStatus)).toEqual(
        HealthSorting.UNHEALTHY
      );
    });

    it("should return sorting value when receives number value", function() {
      const expectedSortingValue = 0;
      const healthStatus = 1;
      const getHealthSortingValueResult = TableUtil.getHealthSortingValue(
        healthStatus
      );

      expect(getHealthSortingValueResult).toEqual(expectedSortingValue);
    });

    it("should return default sorting value", function() {
      const healthStatus = "nada";

      expect(TableUtil.getHealthSortingValue(healthStatus)).toEqual(
        HealthSorting.NA
      );
    });
  });

  /**
   * sort health status by visibility importance order top to bottom
   * unhealthy > NA > warn/idle > healthy
   */
  describe("#sortHealthValues", function() {
    it("should return health sorted by visibility importance when health is string", function() {
      const units = [
        { id: "aa", health: "NA" },
        { id: "bb", health: "Healthy" },
        { id: "cc", health: "Unhealthy" }
      ];
      const expectedResult = [
        { id: "cc", health: "Unhealthy" },
        { id: "aa", health: "NA" },
        { id: "bb", health: "Healthy" }
      ];
      const sortingResult = units.sort(TableUtil.sortHealthValues);

      expect(sortingResult).toEqual(expectedResult);
    });

    it("should return health sorted by visibility importance when health is number", function() {
      const units = [
        { id: "aa", health: 3 },
        { id: "bb", health: 0 },
        { id: "cc", health: 1 }
      ];
      const expectedResult = [
        { id: "cc", health: 1 },
        { id: "aa", health: 3 },
        { id: "bb", health: 0 }
      ];
      const sortingResult = units.sort(TableUtil.sortHealthValues);

      expect(sortingResult).toEqual(expectedResult);
    });
  });
});
