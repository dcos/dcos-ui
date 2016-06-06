import Item from './Item';
import JobActiveRunList from './JobActiveRunList';

module.exports = class Job extends Item {
  getActiveRuns() {
    return new JobActiveRunList({items: this.get('activeRuns')});
  }

  getCommand() {
    return this.get('run').cmd;
  }

  getDescription() {
    return this.get('description');
  }

  getId() {
    return this.get('id');
  }

  getName() {
    return this.getId().split('/').pop();
  }

  getSchedule() {
    return this.get('schedule');
  }
};
