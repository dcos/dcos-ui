import { cleanServiceJSON } from "#SRC/js/utils/CleanJSONUtil";
import { isSDKService } from "#PLUGINS/services/src/js/utils/ServiceUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import FrameworkUtil from "../utils/FrameworkUtil";
import * as ServiceStatus from "../constants/ServiceStatus";

import Application from "./Application";
import FrameworkSpec from "./FrameworkSpec";

const ROUTE_ACCESS_PREFIX = "dcos:adminrouter:service:";
const FRAMEWORK_ID_VALID_CHARACTERS = "\\w-";

const getHighestPriorityStatus = tasks => {
  const statuses = tasks
    .map(t => findNestedPropertyInObject(t, "checkResult.http.statusCode"))
    .map(ServiceStatus.fromHttpCode)
    .filter(status => status);

  return statuses.length !== 0
    ? statuses.reduce((acc, cur) => (cur.priority > acc.priority ? cur : acc))
    : null;
};

module.exports = class Framework extends Application {
  constructor(...args) {
    super(...args);

    // The variable is prefixed because `Item` will expose all the properties
    // it gets as a properties of this object and we want to avoid any naming
    // collisions.
    this._spec = null;
  }

  /**
   * @override
   */
  getImages() {
    return FrameworkUtil.getServiceImages(this.get("images"));
  }

  getPackageName() {
    return this.getLabels().DCOS_PACKAGE_NAME;
  }

  /**
   * @override
   */
  getVersion() {
    return this.getLabels().DCOS_PACKAGE_VERSION;
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

  /**
   * @override
   */
  getStatus() {
    const status = getHighestPriorityStatus(this.get("tasks") || []);

    return status !== null ? status.displayName : super.getStatus();
  }

  /**
   * @override
   */
  getServiceStatus() {
    const status = getHighestPriorityStatus(this.get("tasks") || []);

    return status || super.getServiceStatus();
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

    tasks.reduce((memo, task) => {
      if (task.state !== "TASK_RUNNING" || task.isStartedByMarathon) {
        return memo;
      }
      if (task.statuses != null) {
        return task.statuses.reduce((memo, status) => {
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
    const allocatedFrameworkResources = this.get("used_resources") || {
      cpus: 0,
      mem: 0,
      gpus: 0,
      disk: 0
    };

    // Framework doesn't know how many resources its scheduler consumes.
    // Scheduler is launched by Marathon not the Framework itself.
    // So we should get this information separately from the Marathon spec
    const schedulerResources = this.getSpec().getResources();

    return {
      cpus: allocatedFrameworkResources.cpus + schedulerResources.cpus,
      mem: allocatedFrameworkResources.mem + schedulerResources.mem,
      gpus: allocatedFrameworkResources.gpus + schedulerResources.gpus,
      disk: allocatedFrameworkResources.disk + schedulerResources.disk
    };
  }
};
