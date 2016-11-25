import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import GeneralServiceConfigSection from '../service-configuration/GeneralServiceConfigSection';

class ServiceConfigGeneralSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  getDefinition() {
    return GeneralServiceConfigSection;
  }
}

module.exports = ServiceConfigGeneralSectionDisplay;
