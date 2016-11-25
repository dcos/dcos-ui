import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import NetworkingServiceConfigSection from '../service-configuration/NetworkingServiceConfigSection';

class ServiceConfigNetworkingSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  getDefinition() {
    return NetworkingServiceConfigSection;
  }
}

module.exports = ServiceConfigNetworkingSectionDisplay;
