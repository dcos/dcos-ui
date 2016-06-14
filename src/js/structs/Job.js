import Item from './Item';
import JobActiveRunList from './JobActiveRunList';

module.exports = class Job extends Item {
  getActiveRuns() {
    return new JobActiveRunList({items: this.get('activeRuns')});
  }

  getCommand() {
    const {cmd} = this.get('run') || {};

    return cmd;
  }

  getDescription() {
    return this.get('description');
  }

  getDisk() {
    const {disk = 0} = this.get('run') || {};

    return disk;
  }

  getId() {
    return this.get('id');
  }

  getLabels() {
    return this.get('labels') || {};
  }

  getMem() {
    const {mem = 32} = this.get('run') || {};

    return mem;
  }

  getName() {
    return this.getId().split('.').pop();
  }

  getSchedules() {
    return this.get('schedules');
  }
};
