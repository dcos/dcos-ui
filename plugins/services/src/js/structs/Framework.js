import { cleanServiceJSON } from "#SRC/js/utils/CleanJSONUtil";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from "../constants/FrameworkConstants";
import Application from "./Application";
import FrameworkSpec from "./FrameworkSpec";

module.exports = class Framework extends Application {
  constructor() {
    super(...arguments);

    // The variable is prefixed because `Item` will expose all the properties
    // it gets as a properties of this object and we want to avoid any naming
    // collisions.
    this._spec = null;
  }

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

  /**
   * @override
   */
  getSpec() {
    if (this._spec == null) {
      // State and other _useless_ information is removed to create a clean
      // service spec.
      this._spec = new FrameworkSpec(cleanServiceJSON(this.get()));
    }

    return this._spec;
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
    // There's an unfortunate naming issue in Mesos.
    // used_resources is actually allocated resources
    // the name can't be changed to keep backward compatibility.
    // This is why `getResources` returns `used_resources`
    return (
      this.get("used_resources") || {
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      }
    );
  }
};
