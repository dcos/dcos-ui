import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import {
  getSharedIconWithLabel,
  getContainerNameWithIcon
} from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapTable from "../components/ConfigurationMapTable";

class PodLabelsConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading: "Key",
        prop: "key"
      },
      {
        heading: "Value",
        prop: "value"
      },
      {
        heading: "Container",
        prop: "container"
      }
    ];
  }

  render() {
    const { onEditClick } = this.props;
    const { labels = {}, containers = [] } = this.props.appConfig;

    let combinedLabels = [];

    if (labels != null) {
      combinedLabels = Object.keys(labels).reduce((memo, key) => {
        memo.push({
          key: <code>{key}</code>,
          value: labels[key],
          container: getSharedIconWithLabel()
        });

        return memo;
      }, []);
    }

    combinedLabels = containers.reduce((memo, container) => {
      const { labels = {} } = container;

      if (labels != null) {
        return Object.keys(labels).reduce((cvMemo, key) => {
          cvMemo.push({
            key: <code>{key}</code>,
            value: labels[key],
            container: getContainerNameWithIcon(container)
          });

          return cvMemo;
        }, memo);
      }

      return memo;
    }, combinedLabels);

    if (!combinedLabels.length) {
      return null;
    }

    return (
      <div>
        <ConfigurationMapHeading level={1}>Labels</ConfigurationMapHeading>
        <ConfigurationMapSection key="pod-general-section">
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:Pod:Labels"
            appConfig={this.props.appConfig}
            onEditClick={onEditClick}
          >
            <ConfigurationMapTable
              columnDefaults={{ hideIfEmpty: true }}
              columns={this.getColumns()}
              data={combinedLabels}
              onEditClick={onEditClick}
              tabViewID="multienvironment"
            />
          </MountService.Mount>
        </ConfigurationMapSection>
      </div>
    );
  }
}

PodLabelsConfigSection.defaultProps = {
  appConfig: {}
};

PodLabelsConfigSection.propTypes = {
  appConfig: PropTypes.object,
  onEditClick: PropTypes.func
};

module.exports = PodLabelsConfigSection;
