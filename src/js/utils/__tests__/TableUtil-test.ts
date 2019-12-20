import TableUtil from "../TableUtil";
import HealthSorting from "../../../../plugins/services/src/js/constants/HealthSorting";

const Util = require("../Util").default;

let thisFoo, thisBar, thisGetProp, thisSortFunction;

describe("TableUtil", () => {
  beforeEach(() => {
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

  describe("#getSortFunction", () => {
    beforeEach(() => {
      thisGetProp = (obj, prop) => {
        if (prop === "timestamp") {
          return Util.last(obj.statuses)[prop];
        }

        return obj[prop];
      };

      thisSortFunction = TableUtil.getSortFunction("id", thisGetProp);
    });

    it("returns a function", () => {
      expect(typeof thisSortFunction).toEqual("function");
    });

    it("compares ids values", () => {
      const sortPropFunction = thisSortFunction("id");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles null values", () => {
      const sortPropFunction = thisSortFunction("name");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles undefined values", () => {
      const sortPropFunction = thisSortFunction("version");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles nested properties through getter function", () => {
      const sortPropFunction = thisSortFunction("timestamp");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(-1);
    });

    it("uses if values are equal tiebreaker", () => {
      const sortPropFunction = thisSortFunction("equal");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(1);
    });

    it("handles alternative tiebreaker", () => {
      const sortFunction = TableUtil.getSortFunction("timestamp", thisGetProp);
      const sortPropFunction = sortFunction("equal");
      expect(sortPropFunction(thisFoo, thisBar)).toEqual(-1);
    });
  });

  describe("#getHealthSortingOrder", () => {
    it("returns a function", () => {
      expect(typeof TableUtil.getHealthSortingOrder()).toEqual("function");
    });
  });

  describe("#getHealthSortingValue", () => {
    it("returns sorting value when receives string value", () => {
      const healthStatus = "Unhealthy";

      expect(TableUtil.getHealthSortingValue(healthStatus)).toEqual(
        HealthSorting.UNHEALTHY
      );
    });

    it("returns sorting value when receives number value", () => {
      const expectedSortingValue = 0;
      const healthStatus = 1;
      const getHealthSortingValueResult = TableUtil.getHealthSortingValue(
        healthStatus
      );

      expect(getHealthSortingValueResult).toEqual(expectedSortingValue);
    });

    it("returns default sorting value", () => {
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
  describe("#sortHealthValues", () => {
    it("returns health sorted by visibility importance when health is string", () => {
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

    it("returns health sorted by visibility importance when health is number", () => {
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
