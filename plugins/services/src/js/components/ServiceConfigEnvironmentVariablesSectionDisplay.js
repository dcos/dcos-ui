import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import EnvironmentVariablesServiceConfigSection from '../service-configuration/EnvironmentVariablesServiceConfigSection';

class ServiceConfigEnvironmentVariablesSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
  * @override
  */
  shouldExcludeItem() {
    const {appConfig} = this.props;

    return appConfig.env == null || Object.keys(appConfig.env).length === 0;
  }

  /**
   * @override
   */
  getDefinition() {
    return EnvironmentVariablesServiceConfigSection;
  }
}

module.exports = ServiceConfigEnvironmentVariablesSectionDisplay;
