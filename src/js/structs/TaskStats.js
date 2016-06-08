import Item from './Item';
import TaskStat from './TaskStat';

class TaskStats extends Item {

  /**
   * @return {TaskStat} task statistic about all tasks that run with the same
   * config as the latest app version.
   */
  getStatsForTasksWithLatestConfig() {
    return new TaskStat(this.get('withLatestConfig'));
  }

  /**
   * @return {TaskStat} task statistics about all tasks that were started after
   * the last scaling or restart operation.
   */
  getStatsForTasksStaredAfterLastScaling() {
    return new TaskStat(this.get('startedAfterLastScaling'));
  }

  /**
   * @return {TaskStat} task statistics about all tasks that were started
   * before the last config change which was not simply a restart or scaling
   * operation.
   */
  getStatsForTasksWithOutdatedConfig() {
    return new TaskStat(this.get('withOutdatedConfig'));
  }

  /**
   * @return {TaskStat} task statistics about all tasks
   */
  getStatsForAllTasks() {
    return new TaskStat(this.get('totalSummary'));
  }

}

module.exports = TaskStats;

