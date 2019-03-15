import { cleanJobJSON } from "../utils/CleanJSONUtil";
import Item from "./Item";
import JobRunList from "./JobRunList";
import {
  DEFAULT_CPUS,
  DEFAULT_DISK,
  DEFAULT_MEM
} from "../constants/JobResources";
import { findNestedPropertyInObject } from "../utils/Util";

export default class Job extends Item {
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

  toJSON() {
    return cleanJobJSON(this.get());
  }
}
