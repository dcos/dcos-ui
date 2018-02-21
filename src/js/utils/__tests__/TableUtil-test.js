const MarathonStore = require("../../../../plugins/services/src/js/stores/MarathonStore");
const TableUtil = require("../TableUtil");
const Util = require("../Util");
const HealthSorting = require("../../../../plugins/services/src/js/constants/HealthSorting");

let thisGetServiceHealth, thisFoo, thisBar, thisGetProp, thisSortFunction;

describe("TableUtil", function() {
  beforeEach(function() {
    thisGetServiceHealth = MarathonStore.getServiceHealth;

    thisFoo = {
      equal: 0,
      id: "foo",
      name: null,
      statuses: [{ timestamp: 1 }, { timestamp: 2 }],
      version: "1.0.1"
    };
    thisBar = {
      equal: 0,
      id: "bar",
      name: "bar",
      statuses: [{ timestamp: 4 }],
      version: undefined
    };
  });

  describe("#getSortFunction", function() {
    beforeEach(function() {
      thisGetProp = function(obj, prop) {
        if (prop === "timestamp") {
          return Util.last(obj.statuses)[prop];
        }

        return obj[prop];
      };

      thisSortFunction = TableUtil.getSortFunction("id", thisGetProp);
    });

    it("returns a function", function() {
      expect(typeof thisSortFunction).toEqual("function");
    });

    it("compares ids values", function() {
      var sortPropFunction = thisSortFunction("id");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles null values", function() {
      var sortPropFunction = thisSortFunction("name");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles undefined values", function() {
      var sortPropFunction = thisSortFunction("version");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles nested properties through getter function", function() {
      var sortPropFunction = thisSortFunction("timestamp");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(-1);
    });

    it("uses if values are equal tiebreaker", function() {
      var sortPropFunction = thisSortFunction("equal");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles alternative tiebreaker", function() {
      var sortFunction = TableUtil.getSortFunction("timestamp", thisGetProp);
      var sortPropFunction = sortFunction("equal");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(-1);
    });
  });

  describe("#getHealthSortingOrder", function() {
    it("returns a function", function() {
      expect(typeof TableUtil.getHealthSortingOrder()).toEqual("function");
    });
  });

  describe("#getHealthSortingValue", function() {
    it("returns sorting value when receives string value", function() {
      const healthStatus = "Unhealthy";

      expect(TableUtil.getHealthSortingValue(healthStatus)).toEqual(
        HealthSorting.UNHEALTHY
      );
    });

    it("returns sorting value when receives number value", function() {
      const expectedSortingValue = 0;
      const healthStatus = 1;
      const getHealthSortingValueResult = TableUtil.getHealthSortingValue(
        healthStatus
      );

      expect(getHealthSortingValueResult).toEqual(expectedSortingValue);
    });

    it("returns default sorting value", function() {
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
    it("returns health sorted by visibility importance when health is string", function() {
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

    it("returns health sorted by visibility importance when health is number", function() {
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
