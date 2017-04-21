const TaskStat = require("../TaskStat");

describe("TaskStat", function() {
  describe("#getName", function() {
    it("returns undefined if no name have been provided", function() {
      const statistics = new TaskStat({});

      expect(statistics.getName()).toEqual(undefined);
    });

    it("returns name if name have been provided", function() {
      const statistics = new TaskStat({ name: "foo" });

      expect(statistics.getName()).toEqual("foo");
    });
  });

  describe("#isEmpty", function() {
    it("returns true if no stats have been provided", function() {
      const statistics = new TaskStat({});

      expect(statistics.isEmpty()).toEqual(true);
    });

    it("returns true if stats with no keys have been provided", function() {
      const statistics = new TaskStat({ stats: {} });

      expect(statistics.isEmpty()).toEqual(true);
    });

    it("returns false if stats have been provided", function() {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.isEmpty()).toEqual(false);
    });
  });

  describe("#getHealthyTaskCount", function() {
    it("returns defaults to zero (0) if data is undefined", function() {
      const statistics = new TaskStat({});

      expect(statistics.getHealthyTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", function() {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getHealthyTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", function() {
      const statistics = new TaskStat({ stats: { counts: { healthy: 5 } } });

      expect(statistics.getHealthyTaskCount()).toEqual(5);
    });
  });

  describe("#getRunningTaskCount", function() {
    it("returns defaults to zero (0) if data is undefined", function() {
      const statistics = new TaskStat({});

      expect(statistics.getRunningTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", function() {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getRunningTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", function() {
      const statistics = new TaskStat({ stats: { counts: { running: 10 } } });

      expect(statistics.getRunningTaskCount()).toEqual(10);
    });
  });

  describe("#getStagedTaskCount", function() {
    it("returns defaults to zero (0) if data is undefined", function() {
      const statistics = new TaskStat({});

      expect(statistics.getStagedTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", function() {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getStagedTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", function() {
      const statistics = new TaskStat({ stats: { counts: { staged: 2 } } });

      expect(statistics.getStagedTaskCount()).toEqual(2);
    });
  });

  describe("#getUnhealthyTaskCount", function() {
    it("returns defaults to zero (0) if data is undefined", function() {
      const statistics = new TaskStat({});

      expect(statistics.getUnhealthyTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", function() {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getUnhealthyTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", function() {
      const statistics = new TaskStat({ stats: { counts: { unhealthy: 3 } } });

      expect(statistics.getUnhealthyTaskCount()).toEqual(3);
    });
  });

  describe("#getAverageLifeTime", function() {
    it("returns defaults to zero (0) if data is undefined", function() {
      const statistics = new TaskStat({});

      expect(statistics.getAverageLifeTime()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", function() {
      const statistics = new TaskStat({ stats: { lifeTime: {} } });

      expect(statistics.getAverageLifeTime()).toEqual(0);
    });

    it("returns correct life time", function() {
      const statistics = new TaskStat({
        stats: { lifeTime: { averageSeconds: 60 } }
      });

      expect(statistics.getAverageLifeTime()).toEqual(60);
    });
  });

  describe("#getMediaLifeTime", function() {
    it("returns defaults to zero (0) if data is undefined", function() {
      const statistics = new TaskStat({});

      expect(statistics.getMedianLifeTime()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", function() {
      const statistics = new TaskStat({ stats: { lifeTime: {} } });

      expect(statistics.getMedianLifeTime()).toEqual(0);
    });

    it("returns correct life time", function() {
      const statistics = new TaskStat({
        stats: { lifeTime: { medianSeconds: 40 } }
      });

      expect(statistics.getMedianLifeTime()).toEqual(40);
    });
  });
});
