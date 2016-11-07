import React from 'react';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapLabel from '../../../../../src/js/components/ConfigurationMapLabel';
import ConfigurationMapRow from '../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import Util from '../../../../../src/js/utils/Util';

const shouldExcludeItem = (row, appDefinition) => {
  switch (row.key) {
    case 'gpus':
      return appDefinition.gpus === 0;
    case 'container.volumes':
      return appDefinition.container == null
        || appDefinition.container.volumes == null
        || appDefinition.container.volumes.length === 0;
    case 'healthChecks':
      return appDefinition.healthChecks == null
        || appDefinition.healthChecks.length === 0;
    case 'secrets':
      return appDefinition.secrets == null
        || Object.keys(appDefinition.secrets).length === 0;
    case 'env':
      return appDefinition.env == null
        || Object.keys(appDefinition.env).length === 0;
    case 'labels':
      return appDefinition.labels == null
        || Object.keys(appDefinition.labels).length === 0;
    default:
      return false;
  }
};

const ServiceConfigDisplay = ({appDefinition}) => {
  const configurationMapSections = ServiceConfigDisplayUtil.displayValues.map(
    (section, sectionIndex) => {
      let configurationMapRows = section.values.reduce(
        (memo, row, rowIndex) => {
          // Some rows must be excluded if relevant data is missing.
          if (shouldExcludeItem(row, appDefinition)) {
            return memo;
          }

          let reactKey = `${sectionIndex}.${rowIndex}`;
          let value = null;

          if (row.key != null) {
            value = Util.findNestedPropertyInObject(appDefinition, row.key);
          }

          // If a transformValue was specified on the row, we use it.
          if (row.transformValue != null) {
            value = row.transformValue(value, appDefinition);
          }

          if (row.render != null) {
            // If a custom render method was specified on the row, we use that.
            memo.push(row.render(value, appDefinition));
          } else if (row.heading != null) {
            // If the row is a heading, we render the heading.
            memo.push(
              <ConfigurationMapHeading key={reactKey} level={row.headingLevel}>
                {row.heading}
              </ConfigurationMapHeading>
            );
          } else {
            // Otherwise we treat the row as "label:value" type display.
            let displayValue = null;

            // If the row's type is pre, we wrap it in a pre tag.
            if (row.type === 'pre') {
              displayValue = <pre className="flush transparent wrap">{value}</pre>;
            } else {
              displayValue = ServiceConfigDisplayUtil.getDisplayValue(value);
            }

            memo.push(
              <ConfigurationMapRow key={reactKey}>
                <ConfigurationMapLabel>
                  {row.label}
                </ConfigurationMapLabel>
                <ConfigurationMapValue>
                  {displayValue}
                </ConfigurationMapValue>
              </ConfigurationMapRow>
            );
          }

          return memo;
        },
        []
      );

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
  appDefinition: React.PropTypes.object.isRequired
};

module.exports = ServiceConfigDisplay;
