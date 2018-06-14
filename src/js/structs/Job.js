import { cleanJobJSON } from "../utils/CleanJSONUtil";
import DateUtil from "../utils/DateUtil";
import Item from "./Item";
import JobRunList from "./JobRunList";
import JobStatus from "../constants/JobStatus";
import {
  DEFAULT_CPUS,
  DEFAULT_DISK,
  DEFAULT_MEM
} from "../constants/JobResources";

module.exports = class Job extends Item {
  getActiveRuns() {
    return new JobRunList({ items: this.get("activeRuns") });
  }

  getCommand() {
    const { cmd } = this.get("run") || {};

    return cmd;
  }

  getCpus() {
    const { cpus = DEFAULT_CPUS } = this.get("run") || {};

    return cpus;
  }

  getDescription() {
    return this.get("description");
  }

  getDocker() {
    const { docker = {} } = this.get("run") || {};

    return docker;
  }

  getDisk() {
    const { disk = DEFAULT_DISK } = this.get("run") || {};

    return disk;
  }

  getId() {
    return this.get("id");
  }

  getJobRuns() {
    const activeRuns = this.get("activeRuns") || [];
    const { failedFinishedRuns = [], successfulFinishedRuns = [] } =
      this.get("history") || {};

    return new JobRunList({
      items: [].concat(activeRuns, failedFinishedRuns, successfulFinishedRuns)
    });
  }

  getLabels() {
    return this.get("labels") || {};
  }

  getMem() {
    const { mem = DEFAULT_MEM } = this.get("run") || {};

    return mem;
  }

  getLastRunsSummary() {
    return this.get("historySummary") || {};
  }

  getLastRunStatus() {
    let { lastFailureAt, lastSuccessAt } = this.getLastRunsSummary();
    let status = JobStatus["N/A"].displayName;
    let time = null;

    if (lastFailureAt !== null) {
      lastFailureAt = DateUtil.strToMs(lastFailureAt);
    }

    if (lastSuccessAt !== null) {
      lastSuccessAt = DateUtil.strToMs(lastSuccessAt);
    }

    if (lastFailureAt !== null || lastSuccessAt !== null) {
      if (lastFailureAt > lastSuccessAt) {
        status = JobStatus["Failed"].displayName;
        time = lastFailureAt;
      } else {
        status = JobStatus["Success"].displayName;
        time = lastSuccessAt;
      }
    }

    return { status, time };
  }

  getName() {
    return this.getId()
      .split(".")
      .pop();
  }

  getSchedules() {
    const schedules = this.get("schedules");

    if (!Array.isArray(schedules)) {
      return [];
    }

    return schedules;
  }

  getScheduleStatus() {
    const activeRuns = this.getActiveRuns();
    const activeRunsLength = activeRuns.getItems().length;
    const scheduleLength = this.getSchedules().length;

    if (activeRunsLength > 0) {
      const longestRunningActiveRun = activeRuns.getLongestRunningActiveRun();

      return longestRunningActiveRun.getStatus();
    }

    if (scheduleLength > 0) {
      const schedule = this.getSchedules()[0];

      if (schedule != null && schedule.enabled) {
        return "SCHEDULED";
      }
    }

    if (scheduleLength === 0 && activeRunsLength === 0) {
      return "UNSCHEDULED";
    }

    return "COMPLETED";
  }

  hasSchedule() {
    const [schedule] = this.getSchedules();

    return schedule != null;
  }

  isScheduleEnabled() {
    const [schedule] = this.getSchedules();

    return !!schedule.enabled;
  }

  toJSON() {
    return cleanJobJSON(this.get());
  }
};
