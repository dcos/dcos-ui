const List = require("#SRC/js/structs/List");
const TaskStats = require("../TaskStats");
const TaskStat = require("../TaskStat");

describe("TaskStats", () => {
  describe("#getStatsForTasksWithLatestConfig", () => {
    it("returns task stat instance", () => {
      const statistics = new TaskStats({
        withLatestConfig: {}
      }).getStatsForTasksWithLatestConfig();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it("pass correct data set to task stat struct", () => {
      const statistics = new TaskStats({
        withLatestConfig: {
          stats: {
            counts: { healthy: 1 }
          }
        }
      }).getStatsForTasksWithLatestConfig();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });
  });

  describe("#getStatsForTasksStaredAfterLastScaling", () => {
    it("returns task stat instance", () => {
      const statistics = new TaskStats({
        startedAfterLastScaling: {}
      }).getStatsForTasksStaredAfterLastScaling();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it("pass correct data set to task stat struct", () => {
      const statistics = new TaskStats({
        startedAfterLastScaling: {
          stats: {
            counts: { healthy: 1 }
          }
        }
      }).getStatsForTasksStaredAfterLastScaling();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });
  });

  describe("#getStatsForTasksWithOutdatedConfig", () => {
    it("returns task stat instance", () => {
      const statistics = new TaskStats({
        withOutdatedConfig: {}
      }).getStatsForTasksWithOutdatedConfig();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it("pass correct data set to task stat struct", () => {
      const statistics = new TaskStats({
        withOutdatedConfig: {
          stats: {
            counts: { healthy: 1 }
          }
        }
      }).getStatsForTasksWithOutdatedConfig();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });
  });

  describe("#getStatsForAllTasks", () => {
    it("returns task stat instance", () => {
      const statistics = new TaskStats({
        totalSummary: {}
      }).getStatsForAllTasks();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it("pass correct data set to task stat struct", () => {
      const statistics = new TaskStats({
        totalSummary: {
          stats: {
            counts: { healthy: 1 }
          }
        }
      }).getStatsForAllTasks();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });
  });

  describe("#getList", () => {
    it("returns List instance", () => {
      const statisticsList = new TaskStats({ totalSummary: {} }).getList();

      expect(statisticsList instanceof List).toBeTruthy();
    });

    it("only returns items with stats", () => {
      const statisticsList = new TaskStats({
        totalSummary: {
          stats: {
            counts: { healthy: 1 }
          }
        },
        startedAfterLastScaling: {
          stats: {
            counts: { healthy: 1 }
          }
        },
        withOutdatedConfig: {
          stats: {}
        },
        withLatestConfig: {}
      }).getList();

      expect(statisticsList.getItems().length).toEqual(2);
    });
  });
});
