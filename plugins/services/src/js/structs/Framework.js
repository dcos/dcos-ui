import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from '../constants/FrameworkConstants';
import Application from './Application';
import {cleanServiceJSON} from '../../../../../src/js/utils/CleanJSONUtil';
import FrameworkSpec from './FrameworkSpec';

module.exports = class Framework extends Application {
  getInstancesCount() {
    const tasksRunning = this.get('TASK_RUNNING') || 0;
    return super.getInstancesCount() + tasksRunning;
  }

  getName() {
    const labels = this.getLabels();
    if (labels && labels.DCOS_PACKAGE_FRAMEWORK_NAME) {
      return labels.DCOS_PACKAGE_FRAMEWORK_NAME;
    }
    return super.getName();
  }

  getNodeIDs() {
    return this.get('slave_ids');
  }

  getResourceID() {
    const regexp = new RegExp(`[^${FRAMEWORK_ID_VALID_CHARACTERS}]`, 'g');
    // Strip non-alphanumeric chars from name for safety
    return ROUTE_ACCESS_PREFIX + (this.get('name') || '').replace(regexp, '');
  }

  getSpec() {
    return new FrameworkSpec(cleanServiceJSON(this.get()));
  }

  getTasksSummary() {
    const tasksSummary = Object.assign({}, super.getTasksSummary());

    const tasksRunning = this.get('TASK_RUNNING') || 0;
    tasksSummary.tasksRunning += tasksRunning;
    tasksSummary.tasksUnknown += tasksRunning;

    return tasksSummary;
  }

  getUsageStats(resource) {
    const value = this.get('used_resources')[resource];

    return {value};
  }
};
