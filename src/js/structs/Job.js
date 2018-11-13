import JobStatus from "#PLUGINS/jobs/src/js/constants/JobStatus";

import { cleanJobJSON } from "../utils/CleanJSONUtil";
import DateUtil from "../utils/DateUtil";
import Item from "./Item";
import JobRunList from "./JobRunList";
import {
  DEFAULT_CPUS,
  DEFAULT_DISK,
  DEFAULT_MEM
} from "../constants/JobResources";
import { findNestedPropertyInObject } from "../utils/Util";

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

  isUsingUCR() {
    const runSpec = this.get("run") || {};

    return runSpec.ucr != null;
  }

  getContainer() {
    const runSpec = this.get("run") || {};

    if (runSpec.ucr != null) {
      return runSpec.ucr;
    }
    if (runSpec.docker != null) {
      return runSpec.docker;
    }

    return {};
  }

  getContainerImage() {
    const runSpec = this.get("run") || {};

    if (runSpec.ucr != null) {
      // When using UCR, the `image` is an object in the following format:
      // {
      //    "type": "docker",
      //    "id": "<image name>"
      // }
      return (runSpec.ucr.image || {}).id;
    }
    if (runSpec.docker != null) {
      return runSpec.docker.image;
    }

    return "";
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

  getParameters() {
    return (
      findNestedPropertyInObject(this.get("run"), "docker.parameters") || []
    );
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

  toJSON() {
    return cleanJobJSON(this.get());
  }
};
