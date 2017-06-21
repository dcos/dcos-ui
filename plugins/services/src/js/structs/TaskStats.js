import Item from "../../../../../src/js/structs/Item";
import List from "../../../../../src/js/structs/List";
import TaskStat from "./TaskStat";

const functionMap = {
  withLatestConfig: "getStatsForTasksWithLatestConfig",
  startedAfterLastScaling: "getStatsForTasksStaredAfterLastScaling",
  withOutdatedConfig: "getStatsForTasksWithOutdatedConfig",
  totalSummary: "getStatsForAllTasks"
};

class TaskStats extends Item {
  /**
   * @return {TaskStat} task statistic about all tasks that run with the same
   * config as the latest app version.
   */
  getStatsForTasksWithLatestConfig() {
    const stat = this.get("withLatestConfig") || {};
    stat.name = "withLatestConfig";

    return new TaskStat(stat);
  }

  /**
   * @return {TaskStat} task statistics about all tasks that were started after
   * the last scaling or restart operation.
   */
  getStatsForTasksStaredAfterLastScaling() {
    const stat = this.get("startedAfterLastScaling") || {};
    stat.name = "startedAfterLastScaling";

    return new TaskStat(stat);
  }

  /**
   * @return {TaskStat} task statistics about all tasks that were started
   * before the last config change which was not simply a restart or scaling
   * operation.
   */
  getStatsForTasksWithOutdatedConfig() {
    const stat = this.get("withOutdatedConfig") || {};
    stat.name = "withOutdatedConfig";

    return new TaskStat(stat);
  }

  /**
   * @return {TaskStat} task statistics about all tasks
   */
  getStatsForAllTasks() {
    const stat = this.get("totalSummary") || {};
    stat.name = "totalSummary";

    return new TaskStat(stat);
  }

  /**
   * @return {List} with each of the non-empty types of TaskStat available
   */
  getList() {
    const items = [];

    Object.keys(functionMap).forEach(key => {
      const stat = this[functionMap[key]]();
      if (!stat.isEmpty()) {
        items.push(stat);
      }
    });

    return new List({ items });
  }
}

module.exports = TaskStats;
