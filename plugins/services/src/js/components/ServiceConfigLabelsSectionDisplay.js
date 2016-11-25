import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import LabelsServiceConfigSection from '../service-configuration/LabelsServiceConfigSection';

class ServiceConfigLabelsSectionDisplay extends ServiceConfigBaseSectionDisplay {
  /**
  * @override
  */
  shouldExcludeItem() {
    const {appConfig} = this.props;

    return appConfig.labels == null
      || Object.keys(appConfig.labels).length === 0;
  }

  /**
   * @override
   */
  getDefinition() {
    return LabelsServiceConfigSection;
  }
}

module.exports = ServiceConfigLabelsSectionDisplay;
