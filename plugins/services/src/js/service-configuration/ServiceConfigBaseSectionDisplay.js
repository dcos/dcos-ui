import React from "react";

import { findNestedPropertyInObject } from "../../../../../src/js/utils/Util";
import { getDisplayValue } from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";

class ServiceConfigBaseSectionDisplay extends React.Component {
  shouldExcludeItem() {
    return false;
  }

  getDisplayValue(type, value) {
    // If the row's type is pre, we wrap it in a pre tag.
    if (type === "pre" && value) {
      return <pre className="flush transparent wrap">{value}</pre>;
    }

    return getDisplayValue(value);
  }

  getDefinition() {
    return { values: [] };
  }

  render() {
    const { appConfig, onEditClick } = this.props;
    const { values, tabViewID } = this.getDefinition();

    const configurationMapRows = values
      .filter(row => {
        // Some rows must be excluded if relevant data is missing.
        return !this.shouldExcludeItem(row);
      })
      .map((row, rowIndex) => {
        const reactKey = `${rowIndex}`;
        let value = findNestedPropertyInObject(appConfig, row.key);

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
              {this.getDisplayValue(row.type, value)}
            </ConfigurationMapValue>
            <ConfigurationMapEditAction
              onEditClick={onEditClick}
              tabViewID={tabViewID}
            />
          </ConfigurationMapRow>
        );
      });

    if (configurationMapRows.length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        {configurationMapRows}
      </ConfigurationMapSection>
    );
  }
}

module.exports = ServiceConfigBaseSectionDisplay;
