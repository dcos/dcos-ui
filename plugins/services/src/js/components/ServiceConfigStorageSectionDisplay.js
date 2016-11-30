import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import StorageServiceConfigSection from '../service-configuration/StorageServiceConfigSection';
import Util from '../../../../../src/js/utils/Util';

class ServiceConfigStorageSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const {appConfig} = this.props;
    return !Util.findNestedPropertyInObject(
      appConfig, 'container.volumes.length'
    );
  }

  /**
   * @override
   */
  getDefinition() {
    return StorageServiceConfigSection;
  }
}

module.exports = ServiceConfigStorageSectionDisplay;
