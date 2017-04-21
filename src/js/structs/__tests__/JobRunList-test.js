const moment = require("moment");

const JobRunList = require("../JobRunList");

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
      ).toEqual(moment("1985-01-03T00:00:00Z-1").valueOf());
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
      ).toEqual(moment("1990-01-03T00:01:00Z-1").valueOf());
    });
  });
});
