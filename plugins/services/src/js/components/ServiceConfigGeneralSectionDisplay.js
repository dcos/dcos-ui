import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import GeneralServiceConfigSection from '../service-configuration/GeneralServiceConfigSection';
import Util from '../../../../../src/js/utils/Util';

class ServiceConfigGeneralSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem(row) {
    const {appConfig} = this.props;

    switch (row.key) {
      case 'gpus':
        return !Util.findNestedPropertyInObject(appConfig, 'gpus');
      default:
        return false;
    }
  }

  /**
   * @override
   */
  getDefinition() {
    return GeneralServiceConfigSection;
  }
}

module.exports = ServiceConfigGeneralSectionDisplay;
