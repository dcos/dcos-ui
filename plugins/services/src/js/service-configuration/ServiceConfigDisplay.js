import React from 'react';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapLabel from '../../../../../src/js/components/ConfigurationMapLabel';
import ConfigurationMapRow from '../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';
import GeneralServiceConfigSection from './GeneralServiceConfigSection';
import NetworkingServiceConfigSection from './NetworkingServiceConfigSection';
import StorageServiceConfigSection from './StorageServiceConfigSection';
import EnvironmentVariablesServiceConfigSection from './EnvironmentVariablesServiceConfigSection';
import LabelsServiceConfigSection from './LabelsServiceConfigSection';
import HealthChecksServiceConfigSection from './HealthChecksServiceConfigSection';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import Util from '../../../../../src/js/utils/Util';

const serviceConfigDisplayList = [
  GeneralServiceConfigSection,
  NetworkingServiceConfigSection,
  StorageServiceConfigSection,
  EnvironmentVariablesServiceConfigSection,
  LabelsServiceConfigSection,
  HealthChecksServiceConfigSection
];

const shouldExcludeItem = (row, appConfig) => {
  switch (row.key) {
    case 'gpus':
      return !Util.findNestedPropertyInObject(appConfig, 'gpus');
    case 'container.volumes':
      return !Util.findNestedPropertyInObject(
        appConfig, 'container.volumes.length'
      );
    case 'healthChecks':
      return !Util.findNestedPropertyInObject(appConfig, 'healthChecks.length');
    case 'secrets':
      return appConfig.secrets == null
        || Object.keys(appConfig.secrets).length === 0;
    case 'env':
      return appConfig.env == null
        || Object.keys(appConfig.env).length === 0;
    case 'labels':
      return appConfig.labels == null
        || Object.keys(appConfig.labels).length === 0;
    default:
      return false;
  }
};

const getDisplayValue = (type, value) => {
  // If the row's type is pre, we wrap it in a pre tag.
  if (type === 'pre') {
    return <pre className="flush transparent wrap">{value}</pre>;
  }

  return ServiceConfigDisplayUtil.getDisplayValue(value);
};

const ServiceConfigDisplay = ({appConfig}) => {
  const configurationMapSections = serviceConfigDisplayList.map(
    (section, sectionIndex) => {
      let configurationMapRows = section.values.filter((row) => {
        // Some rows must be excluded if relevant data is missing.
        return !shouldExcludeItem(row, appConfig);
      })
      .map((row, rowIndex) => {
        let reactKey = `${sectionIndex}.${rowIndex}`;
        let value = Util.findNestedPropertyInObject(appConfig, row.key);

        // If a transformValue was specified on the row, we use it.
        if (row.transformValue != null) {
          value = row.transformValue(value, appConfig);
        }

        if (row.render != null) {
          // If a custom render method was specified on the row, we use that.
          return row.render(value, appConfig);
        } else if (row.heading != null) {
          // If the row is a heading, we render the heading.
          return (
            <ConfigurationMapHeading key={reactKey} level={row.headingLevel}>
              {row.heading}
            </ConfigurationMapHeading>
          );
        }

        // Otherwise we treat the row as "label:value" type display.
        return (
          <ConfigurationMapRow key={reactKey}>
            <ConfigurationMapLabel>
              {row.label}
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {getDisplayValue(row.type, value)}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        );
      });

      if (configurationMapRows.length === 0) {
        return null;
      }

      return (
        <ConfigurationMapSection key={sectionIndex}>
          {configurationMapRows}
        </ConfigurationMapSection>
      );
    }
  );

  return (
    <div className="flex-item-grow-1">
      <div className="container">
        <ConfigurationMap>
          {configurationMapSections}
        </ConfigurationMap>
      </div>
    </div>
  );
};

ServiceConfigDisplay.propTypes = {
  appConfig: React.PropTypes.object.isRequired
};

module.exports = ServiceConfigDisplay;
