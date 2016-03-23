import {
  ROUTE_ACCESS_PREFIX,
  FRAMEWORK_ID_VALID_CHARACTERS
} from '../constants/FrameworkConstants';
import Service from './Service';
import FrameworkUtil from '../utils/FrameworkUtil';
import Util from '../utils/Util';

module.exports = class Framework extends Service {
  getImages() {
    return FrameworkUtil.getServiceImages(this.getMetadata().images);
  }

  getMetadata() {
    let labels = this.getLabels();
    if (Util.findNestedPropertyInObject(labels, 'DCOS_PACKAGE_METADATA.length') == null) {
      return {};
    }

    // extract content of the DCOS_PACKAGE_METADATA label
    try {
      var dataAsJsonString = global.atob(labels.DCOS_PACKAGE_METADATA);
      return JSON.parse(dataAsJsonString);
    } catch (error) {
      return {};
    }
  }

  getNodeIDs() {
    return this.get('slave_ids');
  }

  getResourceID() {
    let regexp = new RegExp(`[^${FRAMEWORK_ID_VALID_CHARACTERS}]`, 'g');
    // strip non-alphanumeric chars from name for safety
    return ROUTE_ACCESS_PREFIX + (this.get('name') || '').replace(regexp, '');
  }

  getMetadata() {
    let labels = this.getLabels();
    if (Util.findNestedPropertyInObject(labels, 'DCOS_PACKAGE_METADATA.length') == null) {
      return {};
    }

    // extract content of the DCOS_PACKAGE_METADATA label
    try {
      var dataAsJsonString = global.atob(labels.DCOS_PACKAGE_METADATA);
      return JSON.parse(dataAsJsonString);
    } catch (error) {
      return {};
    }
  }

  getImages() {
    return FrameworkUtil.getServiceImages(this.getMetadata().images);
  }

  getUsageStats(resource) {
    let value = this.get('used_resources')[resource];

    return {value};
  }

  getWebURL() {
    let url = this.get('webui_url');

    if (url != null && url !== '') {
      return url;
    }

    return null;
  }
};
