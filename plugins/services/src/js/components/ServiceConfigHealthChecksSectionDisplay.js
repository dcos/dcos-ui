import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import HealthChecksServiceConfigSection from '../service-configuration/HealthChecksServiceConfigSection';
import Util from '../../../../../src/js/utils/Util';

class ServiceConfigHealthChecksSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const {appConfig} = this.props;
    return !Util.findNestedPropertyInObject(appConfig, 'healthChecks.length');
  }

  /**
   * @override
   */
  getDefinition() {
    return HealthChecksServiceConfigSection;
  }
}

module.exports = ServiceConfigHealthChecksSectionDisplay;
