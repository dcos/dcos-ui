import { cleanServiceJSON } from "#SRC/js/utils/CleanJSONUtil";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from "../constants/FrameworkConstants";
import Application from "./Application";
import FrameworkSpec from "./FrameworkSpec";

module.exports = class Framework extends Application {
  getPackageName() {
    return this.getLabels().DCOS_PACKAGE_NAME;
  }

  getFrameworkName() {
    return this.getLabels().DCOS_PACKAGE_FRAMEWORK_NAME;
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
    const isSDK = isSDKService(this);
    // TODO: Circular reference workaround DCOS_OSS-783
    const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

    const tasksSummary = Object.assign({}, super.getTasksSummary());
    const tasks = MesosStateStore.getTasksByService(this) || [];
    const tasksRunning = this.get("TASK_RUNNING") || 0;
    tasksSummary.tasksRunning += tasksRunning;
    tasksSummary.tasksUnknown += tasksRunning;

    tasks.reduce(function(memo, task) {
      if (task.state !== "TASK_RUNNING" || task.isStartedByMarathon) {
        return memo;
      }
      if (task.statuses != null) {
        return task.statuses.reduce(function(memo, status) {
          if (status.healthy || (isSDK && status.healthy === undefined)) {
            memo.tasksHealthy++;
            memo.tasksUnknown--;
          }
          if (status.healthy === false) {
            memo.tasksUnhealthy++;
            memo.tasksUnknown--;
          }

          return memo;
        }, memo);
      }

      return memo;
    }, tasksSummary);

    return tasksSummary;
  }

  getUsageStats(resource) {
    const value = this.get("used_resources")[resource];

    return { value };
  }

  getResources() {
    // TODO: Circular reference workaround DCOS_OSS-783
    const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

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
        const { cpus = 0, mem = 0, gpus = 0, disk = 0 } = task.resources;

        return {
          cpus: memo.cpus + cpus,
          mem: memo.mem + mem,
          gpus: memo.gpus + gpus,
          disk: memo.disk + disk
        };
      }, frameworkResources);
  }
};
