const List = require('../List');
const TaskStats = require('../TaskStats');
const TaskStat = require('../TaskStat');

describe('TaskStats', function () {

  describe('#getStatsForTasksWithLatestConfig', function () {

    it('returns task stat instance', function () {
      let statistics = new TaskStats({withLatestConfig: {}})
        .getStatsForTasksWithLatestConfig();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it('pass correct data set to task stat struct', function () {
      let statistics = new TaskStats({
        withLatestConfig: {
          stats: {
            counts: {healthy: 1}
          }
        }
      }).getStatsForTasksWithLatestConfig();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });

  });

  describe('#getStatsForTasksStaredAfterLastScaling', function () {

    it('returns task stat instance', function () {
      let statistics = new TaskStats({startedAfterLastScaling: {}})
        .getStatsForTasksStaredAfterLastScaling();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it('pass correct data set to task stat struct', function () {
      let statistics = new TaskStats({
        startedAfterLastScaling: {
          stats: {
            counts: {healthy: 1}
          }
        }
      }).getStatsForTasksStaredAfterLastScaling();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });

  });

  describe('#getStatsForTasksWithOutdatedConfig', function () {

    it('returns task stat instance', function () {
      let statistics = new TaskStats({withOutdatedConfig: {}})
        .getStatsForTasksWithOutdatedConfig();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it('pass correct data set to task stat struct', function () {
      let statistics = new TaskStats({
        withOutdatedConfig: {
          stats: {
            counts: {healthy: 1}
          }
        }
      }).getStatsForTasksWithOutdatedConfig();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });

  });

  describe('#getStatsForAllTasks', function () {

    it('returns task stat instance', function () {
      let statistics = new TaskStats({totalSummary: {}}).getStatsForAllTasks();

      expect(statistics instanceof TaskStat).toBeTruthy();
    });

    it('pass correct data set to task stat struct', function () {
      let statistics = new TaskStats({
        totalSummary: {
          stats: {
            counts: {healthy: 1}
          }
        }
      }).getStatsForAllTasks();

      expect(statistics.getHealthyTaskCount()).toEqual(1);
    });

  });

  describe('#getList', function () {

    it('returns List instance', function () {
      let statisticsList = new TaskStats({totalSummary: {}}).getList();

      expect(statisticsList instanceof List).toBeTruthy();
    });

    it('should only return items with stats', function () {
      let statisticsList = new TaskStats({
        totalSummary: {
          stats: {
            counts: {healthy: 1}
          }
        },
        startedAfterLastScaling: {
          stats: {
            counts: {healthy: 1}
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
