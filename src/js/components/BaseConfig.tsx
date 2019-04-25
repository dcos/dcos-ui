import * as React from "react";
import { Trans } from "@lingui/macro";
import { MountService } from "foundation-ui";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

import { getDisplayValue } from "#SRC/js/utils/ConfigDisplayUtil";

interface BaseConfigProps<T> {
  config: T;
  onEditClick?: () => void;
}

export interface Value<T> {
  key?: string;
  label?: string | React.ReactNode;
  heading?: string | React.ReactNode;
  headingLevel?: number;
  type?: string;
  render?: (data: any, config?: T) => React.ReactNode;
  transformValue?: (value: any, config: T) => string | React.ReactNode;
}

interface Definition<T> {
  values: Array<Value<T>>;
  tabViewID?: string;
}

class BaseConfig<T> extends React.Component<BaseConfigProps<T>, object> {
  shouldExcludeItem(_value: Value<T>) {
    return false;
  }

  getDisplayValue(type: string | undefined, value: Value<T>) {
    // If the row's type is pre, we wrap it in a pre tag.
    if (type === "pre" && value) {
      return <pre className="flush transparent wrap">{value}</pre>;
    }

    return getDisplayValue(value);
  }

  getDefinition(): Definition<T> {
    return { values: [] };
  }

  getMountType() {
    throw Error(
      "You have to implement this method in your class providing a unique MountPointName, Namespace: CreateService:ServiceConfigDisplay:App:"
    );
  }

  render() {
    const { config, onEditClick } = this.props;
    const { values, tabViewID } = this.getDefinition();

    const configurationMapRows = values
      .filter(row => {
        // Some rows must be excluded if relevant data is missing.
        return !this.shouldExcludeItem(row);
      })
      .map((row, rowIndex) => {
        const reactKey = `${rowIndex}`;
        let value = findNestedPropertyInObject(config, row.key);

        // If a transformValue was specified on the row, we use it.
        if (row.transformValue != null) {
          value = row.transformValue(value, config);
        }

        if (row.render != null) {
          // If a custom render method was specified on the row, we use that.
          return row.render(value, config);
        } else if (row.heading != null) {
          // If the row is a heading, we render the heading.
          return (
            <ConfigurationMapHeading key={reactKey} level={row.headingLevel}>
              {row.heading}
            </ConfigurationMapHeading>
          );
        }

        let action;
        if (onEditClick) {
          action = (
            <Trans
              render={
                <a
                  className="button button-link flush table-display-on-row-hover"
                  onClick={onEditClick.bind(null, { tabViewID })}
                />
              }
            >
              Edit
            </Trans>
          );
        }

        // Otherwise we treat the row as "label:value" type display.
        return (
          <ConfigurationMapRow key={reactKey}>
            <ConfigurationMapLabel>{row.label}</ConfigurationMapLabel>
            <ConfigurationMapValue>
              {this.getDisplayValue(row.type, value)}
            </ConfigurationMapValue>
            {action}
          </ConfigurationMapRow>
        );
      });

    if (configurationMapRows.length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <MountService.Mount
          config={config}
          onEditClick={onEditClick}
          type={this.getMountType()}
        >
          {configurationMapRows}
        </MountService.Mount>
      </ConfigurationMapSection>
    );
  }
}

export default BaseConfig;
