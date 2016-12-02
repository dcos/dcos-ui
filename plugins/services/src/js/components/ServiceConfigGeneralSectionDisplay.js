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
      case 'fetch':
        return !Util.findNestedPropertyInObject(appConfig, 'fetch.length');
      case 'gpus':
        return !Util.findNestedPropertyInObject(appConfig, 'gpus');
      case 'backoffSeconds':
        return !Util.findNestedPropertyInObject(appConfig, 'backoffSeconds');
      case 'backoffFactor':
        return !Util.findNestedPropertyInObject(appConfig, 'backoffFactor');
      case 'maxLaunchDelaySeconds':
        return !Util.findNestedPropertyInObject(
          appConfig, 'maxLaunchDelaySeconds'
        );
      case 'minHealthOpacity':
        return !Util.findNestedPropertyInObject(appConfig, 'minHealthOpacity');
      case 'maxOverCapacity':
        return !Util.findNestedPropertyInObject(appConfig, 'maxOverCapacity');
      case 'acceptedResourceRoles':
        return !Util.findNestedPropertyInObject(
          appConfig, 'acceptedResourceRoles.length'
        );
      case 'dependencies':
        return !Util.findNestedPropertyInObject(
          appConfig, 'dependencies.length'
        );
      case 'executor':
        return !Util.findNestedPropertyInObject(appConfig, 'executor');
      case 'user':
        return !Util.findNestedPropertyInObject(appConfig, 'user');
      case 'args':
        return !Util.findNestedPropertyInObject(appConfig, 'args.length');
      case 'version':
        return !Util.findNestedPropertyInObject(appConfig, 'version');
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
