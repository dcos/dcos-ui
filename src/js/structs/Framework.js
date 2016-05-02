import {
  ROUTE_ACCESS_PREFIX,
  SERVICE_ID_VALID_CHARACTERS
} from '../constants/ServiceConstants';
import Service from './Service';

module.exports = class Framework extends Service {
  getHealth() {
    let meta = this.get('_meta');
    if (!meta || !meta.marathon) {
      return HealthStatus.NA;
    }
    return meta.marathon.health;
  }

  getResourceID() {
    let regexp = new RegExp(`[^${SERVICE_ID_VALID_CHARACTERS}]`, 'g');
    // strip non-alphanumeric chars from name for safety
    return ROUTE_ACCESS_PREFIX + (this.get('name') || '').replace(regexp, '');
  }

  getNodeIDs() {
    return this.get('slave_ids');
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
