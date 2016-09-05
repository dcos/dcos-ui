import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from '../constants/FrameworkConstants';
import Application from './Application';

module.exports = class Framework extends Application {
  getName() {
    let labels = this.getLabels();
    if (labels && labels.DCOS_PACKAGE_FRAMEWORK_NAME) {
      return labels.DCOS_PACKAGE_FRAMEWORK_NAME;
    }
    return super.getName();
  }

  getNodeIDs() {
    return this.get('slave_ids');
  }

  getResourceID() {
    let regexp = new RegExp(`[^${FRAMEWORK_ID_VALID_CHARACTERS}]`, 'g');
    // Strip non-alphanumeric chars from name for safety
    return ROUTE_ACCESS_PREFIX + (this.get('name') || '').replace(regexp, '');
  }

  getSpec() {
    // DCOS-9613: This should be properly implemented
    return this;
  }

  getUsageStats(resource) {
    let value = this.get('used_resources')[resource];

    return {value};
  }
};
