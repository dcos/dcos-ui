const JobRunList = require("../JobRunList");
const DateUtil = require("../../utils/DateUtil");

describe("JobRunList", function() {
  describe("#getLongestRunningActiveRun", function() {
    it("returns the longest running active run", function() {
      const activeRunList = new JobRunList({
        items: [
          { createdAt: "1990-01-03T00:00:00Z-1" },
          { createdAt: "1985-01-03T00:00:00Z-1" },
          { createdAt: "1995-01-03T00:00:00Z-1" }
        ]
      });

      expect(
        activeRunList.getLongestRunningActiveRun().getDateCreated()
      ).toEqual(DateUtil.strToMs("1985-01-03T00:00:00Z-1"));
    });

    it("returns the longest running active run", function() {
      const activeRunList = new JobRunList({
        items: [
          { createdAt: "1990-01-03T00:10:00Z-1" },
          { createdAt: "1990-01-03T00:05:00Z-1" },
          { createdAt: "1990-01-03T00:01:00Z-1" }
        ]
      });

      expect(
        activeRunList.getLongestRunningActiveRun().getDateCreated()
      ).toEqual(DateUtil.strToMs("1990-01-03T00:01:00Z-1"));
    });
  });
});
