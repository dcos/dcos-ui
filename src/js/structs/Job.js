import DateUtil from '../utils/DateUtil';
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

  getCpus() {
    // Default to the minimum number of cpus per Mesos offer
    const {cpus = 0.01} = this.get('run') || {};

    return cpus;
  }

  getDescription() {
    return this.get('description');
  }

  getDocker() {
    const {docker = {}} = this.get('run') || {};

    return docker;
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

  getLastRunStatus() {
    let {lastFailureAt = null, lastSuccessAt = null} = this.getStatus();
    let status = 'N/A';
    let time = null;

    if (lastFailureAt !== null) {
      lastFailureAt = DateUtil.strToMs(lastFailureAt);
    }

    if (lastSuccessAt !== null) {
      lastSuccessAt = DateUtil.strToMs(lastSuccessAt);
    }

    if (lastFailureAt !== null || lastSuccessAt !== null) {
      if (lastFailureAt > lastSuccessAt) {
        status = 'Failed';
        time = lastFailureAt;
      } else {
        status = 'Success';
        time = lastSuccessAt;
      }
    }

    return {status, time};
  }

  getName() {
    return this.getId().split('.').pop();
  }

  getSchedules() {
    return this.get('schedules') || [];
  }

  getScheduleStatus() {
    let activeRuns = this.getActiveRuns();

    if (activeRuns.getItems().length > 0) {
      let longestRunningActiveRun = activeRuns.getLongestRunningActiveRun();
      return longestRunningActiveRun.getStatus();
    }

    if (this.getSchedules().length > 0) {
      let schedule = this.getSchedules()[0];

      if (!!schedule && schedule.enabled) {
        return 'scheduled';
      }
    }

    return 'completed';
  }

  getStatus() {
    return this.get('status') || {};
  }
};
