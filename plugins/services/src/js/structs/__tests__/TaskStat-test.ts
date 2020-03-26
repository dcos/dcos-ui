import TaskStat from "../TaskStat";

describe("TaskStat", () => {
  describe("#getName", () => {
    it("returns undefined if no name have been provided", () => {
      const statistics = new TaskStat({});

      expect(statistics.getName()).toEqual(undefined);
    });

    it("returns name if name have been provided", () => {
      const statistics = new TaskStat({ name: "foo" });

      expect(statistics.getName()).toEqual("foo");
    });
  });

  describe("#isEmpty", () => {
    it("returns true if no stats have been provided", () => {
      const statistics = new TaskStat({});

      expect(statistics.isEmpty()).toEqual(true);
    });

    it("returns true if stats with no keys have been provided", () => {
      const statistics = new TaskStat({ stats: {} });

      expect(statistics.isEmpty()).toEqual(true);
    });

    it("returns false if stats have been provided", () => {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.isEmpty()).toEqual(false);
    });
  });

  describe("#getHealthyTaskCount", () => {
    it("returns defaults to zero (0) if data is undefined", () => {
      const statistics = new TaskStat({});

      expect(statistics.getHealthyTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", () => {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getHealthyTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", () => {
      const statistics = new TaskStat({ stats: { counts: { healthy: 5 } } });

      expect(statistics.getHealthyTaskCount()).toEqual(5);
    });
  });

  describe("#getRunningTaskCount", () => {
    it("returns defaults to zero (0) if data is undefined", () => {
      const statistics = new TaskStat({});

      expect(statistics.getRunningTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", () => {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getRunningTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", () => {
      const statistics = new TaskStat({ stats: { counts: { running: 10 } } });

      expect(statistics.getRunningTaskCount()).toEqual(10);
    });
  });

  describe("#getStagedTaskCount", () => {
    it("returns defaults to zero (0) if data is undefined", () => {
      const statistics = new TaskStat({});

      expect(statistics.getStagedTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", () => {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getStagedTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", () => {
      const statistics = new TaskStat({ stats: { counts: { staged: 2 } } });

      expect(statistics.getStagedTaskCount()).toEqual(2);
    });
  });

  describe("#getUnhealthyTaskCount", () => {
    it("returns defaults to zero (0) if data is undefined", () => {
      const statistics = new TaskStat({});

      expect(statistics.getUnhealthyTaskCount()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", () => {
      const statistics = new TaskStat({ stats: { counts: {} } });

      expect(statistics.getUnhealthyTaskCount()).toEqual(0);
    });

    it("returns correct number of tasks", () => {
      const statistics = new TaskStat({ stats: { counts: { unhealthy: 3 } } });

      expect(statistics.getUnhealthyTaskCount()).toEqual(3);
    });
  });

  describe("#getAverageLifeTime", () => {
    it("returns defaults to zero (0) if data is undefined", () => {
      const statistics = new TaskStat({});

      expect(statistics.getAverageLifeTime()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", () => {
      const statistics = new TaskStat({ stats: { lifeTime: {} } });

      expect(statistics.getAverageLifeTime()).toEqual(0);
    });

    it("returns correct life time", () => {
      const statistics = new TaskStat({
        stats: { lifeTime: { averageSeconds: 60 } },
      });

      expect(statistics.getAverageLifeTime()).toEqual(60);
    });
  });

  describe("#getMediaLifeTime", () => {
    it("returns defaults to zero (0) if data is undefined", () => {
      const statistics = new TaskStat({});

      expect(statistics.getMedianLifeTime()).toEqual(0);
    });

    it("returns defaults to zero (0) if property is undefined", () => {
      const statistics = new TaskStat({ stats: { lifeTime: {} } });

      expect(statistics.getMedianLifeTime()).toEqual(0);
    });

    it("returns correct life time", () => {
      const statistics = new TaskStat({
        stats: { lifeTime: { medianSeconds: 40 } },
      });

      expect(statistics.getMedianLifeTime()).toEqual(40);
    });
  });
});
