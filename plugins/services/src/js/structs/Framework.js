import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from "../constants/FrameworkConstants";
import Application from "./Application";
import { cleanServiceJSON } from "../../../../../src/js/utils/CleanJSONUtil";
import FrameworkSpec from "./FrameworkSpec";

module.exports = class Framework extends Application {
  getName() {
    const labels = this.getLabels();
    if (labels && labels.DCOS_PACKAGE_FRAMEWORK_NAME) {
      return labels.DCOS_PACKAGE_FRAMEWORK_NAME;
    }

    return super.getName();
  }

  getNodeIDs() {
    return this.get("slave_ids");
  }

  getResourceID() {
    const regexp = new RegExp(`[^${FRAMEWORK_ID_VALID_CHARACTERS}]`, "g");

    // Strip non-alphanumeric chars from name for safety
    return ROUTE_ACCESS_PREFIX + (this.get("name") || "").replace(regexp, "");
  }

  getSpec() {
    return new FrameworkSpec(cleanServiceJSON(this.get()));
  }

  getTasksSummary() {
    const tasksSummary = Object.assign({}, super.getTasksSummary());
    const tasksRunning = this.get("TASK_RUNNING") || 0;
    tasksSummary.tasksRunning += tasksRunning;
    tasksSummary.tasksUnknown += tasksRunning;

    return tasksSummary;
  }

  getUsageStats(resource) {
    const value = this.get("used_resources")[resource];

    return { value };
  }

  getResources() {
    // TODO: Circular reference workaround DCOS_OSS-783
    const MesosStateStore = require("../../../../../src/js/stores/MesosStateStore");

    const tasks = MesosStateStore.getTasksByService(this) || [];

    const instances = this.getInstancesCount();
    const {
      cpus = 0,
      mem = 0,
      gpus = 0,
      disk = 0
    } = this.getSpec().getResources();

    const frameworkResources = {
      cpus: cpus * instances,
      mem: mem * instances,
      gpus: gpus * instances,
      disk: disk * instances
    };

    // Aggregate all the child tasks resources
    // resources of child frameworks won't be aggregated
    return tasks
      .filter(function(task) {
        return task.state === "TASK_RUNNING" && !task.isStartedByMarathon;
      })
      .reduce(function(memo, task) {
        const { cpus, mem, gpus, disk } = task.resources;

        return {
          cpus: memo.cpus + cpus,
          mem: memo.mem + mem,
          gpus: memo.gpus + gpus,
          disk: memo.disk + disk
        };
      }, frameworkResources);
  }
};
