import { cleanServiceJSON } from "#SRC/js/utils/CleanJSONUtil";
import { isSDKService } from "#PLUGINS/services/src/js/utils/ServiceUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from "../constants/FrameworkConstants";
import FrameworkUtil from "../utils/FrameworkUtil";
import ServiceStatus from "../constants/ServiceStatus";

import Application from "./Application";
import FrameworkSpec from "./FrameworkSpec";

const frameworkStatusHelper = (displayName, key, priority = 0) => ({
  displayName,
  key,
  priority
});

// prettier-ignore
/* eslint-disable no-multi-spaces */
const FrameworkStatus = {
  418: frameworkStatusHelper("Initializing",                    ServiceStatus.DEPLOYING,  1),
  200: frameworkStatusHelper("Running",                         ServiceStatus.RUNNING,    1),
  500: frameworkStatusHelper("Error Creating Service",          ServiceStatus.WARNING,    1),
  204: frameworkStatusHelper("Deploying (Awaiting Resources)",  ServiceStatus.DEPLOYING,  2),
  202: frameworkStatusHelper("Deploying",                       ServiceStatus.DEPLOYING,  2),
  203: frameworkStatusHelper("Degraded (Awaiting Resources)",   ServiceStatus.RECOVERING, 4),
  205: frameworkStatusHelper("Degraded (Recovering)",           ServiceStatus.RECOVERING, 4),
  206: frameworkStatusHelper("Degraded",                        ServiceStatus.RECOVERING, 3),
  420: frameworkStatusHelper("Backing up",                      ServiceStatus.RECOVERING, 5),
  421: frameworkStatusHelper("Restoring",                       ServiceStatus.RECOVERING, 5),
  426: frameworkStatusHelper("Upgrade / Rollback / Downgrade",  ServiceStatus.DEPLOYING,  6),
  503: frameworkStatusHelper("Service Unavailable",             ServiceStatus.STOPPED)
};
/* eslint-enable */

module.exports = class Framework extends Application {
  constructor() {
    super(...arguments);

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

  getCheckStatus() {
    const tasks = this.get("tasks") || [];
    const checkStatus = tasks.reduce((acc, cur = {}) => {
      if (cur.checkResult != null) {
        const curStatusCode = findNestedPropertyInObject(
          cur,
          "checkResult.http.statusCode"
        );
        const accStatusCode =
          findNestedPropertyInObject(acc, "checkResult.http.statusCode") ||
          null;
        const curPriority =
          (FrameworkStatus[curStatusCode] &&
            FrameworkStatus[curStatusCode].priority) ||
          0;
        const accPriority =
          (FrameworkStatus[accStatusCode] &&
            FrameworkStatus[accStatusCode].priority) ||
          0;
        if (curPriority > accPriority) {
          return cur;
        }
      }

      return acc;
    }, false);

    if (checkStatus == null) {
      return false;
    }

    return checkStatus;
  }

  /**
   * @override
   */
  getStatus() {
    const checkStatus = this.getCheckStatus();
    const statusCode = findNestedPropertyInObject(
      checkStatus,
      "checkResult.http.statusCode"
    );

    return checkStatus
      ? FrameworkStatus[statusCode].displayName
      : super.getStatus();
  }

  /**
   * @override
   */
  getServiceStatus() {
    const checkStatus = this.getCheckStatus();
    const statusCode = findNestedPropertyInObject(
      checkStatus,
      "checkResult.http.statusCode"
    );

    return checkStatus
      ? FrameworkStatus[statusCode].key
      : super.getServiceStatus();
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
