import TaskStates from '../constants/TaskStates';

module.exports = class Item {
  constructor(item = {}) {
    Object.keys(item).forEach(function (key) {
      this[key] = item[key];
    }, this);

    this._itemData = item;
  }

  get(key) {
    if (key == null) {
      return this._itemData;
    }

    return this._itemData[key];
  }

  sumTaskTypesByState(state) {
    let sum = 0;

    Object.keys(TaskStates).forEach(function (taskType) {
      if (TaskStates[taskType].stateTypes.indexOf(state) !== -1) {
        // Make sure there's a value
        if (this[taskType]) {
          sum += this[taskType];
        }
      }
    }, this);

    return sum;
  }
};
