import Item from './Item';
import JobActiveRunList from './JobActiveRunList';

module.exports = class Job extends Item {
  constructor() {
    super(...arguments);

    const id = this.getId();
    if (id !== '/' && (!id.startsWith('/') || id.endsWith('/'))) {
      throw new Error(`Id (${id}) must start with a leading slash ("/") and should not end with a slash, except for root id which is only a slash`);
    }
  }

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
