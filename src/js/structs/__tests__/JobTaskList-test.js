import DateUtil from "../../utils/DateUtil";

const JobTaskList = require("../JobTaskList");

describe("JobTaskList", () => {
  describe("#getLongestRunningTask", () => {
    it("returns the longest running task", () => {
      const activeRunList = new JobTaskList({
        items: [
          { startedAt: "1990-01-03T00:00:00Z-1" },
          { startedAt: "1985-01-03T00:00:00Z-1" },
          { startedAt: "1995-01-03T00:00:00Z-1" }
        ]
      });

      expect(activeRunList.getLongestRunningTask().getDateStarted()).toEqual(
        DateUtil.strToMs("1985-01-03T00:00:00Z-1")
      );
    });

    it("handles tasks with undefined startedAt values", () => {
      const activeRunList = new JobTaskList({
        items: [
          { startedAt: "1990-03-03T00:00:00Z-1" },
          { foo: "bar" },
          { startedAt: "1990-10-03T00:00:00Z-1" },
          { bar: "baz" },
          { startedAt: "1990-01-03T00:00:00Z-1" }
        ]
      });

      expect(activeRunList.getLongestRunningTask().getDateStarted()).toEqual(
        DateUtil.strToMs("1990-01-03T00:00:00Z-1")
      );
    });
  });
});
