import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import StorageServiceConfigSection from '../service-configuration/StorageServiceConfigSection';

class ServiceConfigStorageSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  getDefinition() {
    return StorageServiceConfigSection;
  }
}

module.exports = ServiceConfigStorageSectionDisplay;
