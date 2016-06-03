import moment from 'moment';

import Item from './Item';

module.exports = class JobTask extends Item {
  getDateStarted() {
    let dateStarted = this.get('startedAt');

    if (dateStarted != null) {
      return moment(dateStarted);
    }

    return null;
  }

  getDateCompleted() {
    let dateCompleted = this.get('completedAt');

    if (dateCompleted != null) {
      return moment(dateCompleted);
    }

    return null;
  }

  getTaskID() {
    return this.get('id');
  }

  getStatus() {
    return this.get('status');
  }
};
