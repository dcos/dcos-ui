const tasks = new Map();
let executing = false;

function executeTasks(time) {
  tasks.forEach(function ({task, lastExecution, interval}, id) {
    if (time >= interval + lastExecution) {
      tasks.set(id, {interval, lastExecution: time, task});
      task();
    }
  });

  // Using `requestAnimationFrame` to execute the tasks has the great advantage
  // that it will automatically "pause" the execution if the application window
  // is inactive.
  global.requestAnimationFrame(executeTasks);
}

function startTaskExecution() {
  if (!executing && tasks.size > 0) {
    executing = true;
    global.requestAnimationFrame(executeTasks);
  }
}

function stopTaskExecution() {
  executing = false;
}

const RecurrentTaskUtil = {
  /**
   * Schedule recurrent task
   * @param {string} id
   * @param {function} task
   * @param {number} interval
   */
  scheduleTask(id, task, interval) {
    tasks.set(id, {lastExecution: -interval, interval, task});
    startTaskExecution();
  },

  /**
   * Stop task
   * @param {function} id
   */
  stopTask(id) {
    tasks.delete(id);
    if (tasks.size === 0) {
      stopTaskExecution();
    }
  }
};

module.exports = RecurrentTaskUtil;
