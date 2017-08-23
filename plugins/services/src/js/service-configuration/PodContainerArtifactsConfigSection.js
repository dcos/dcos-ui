/* @flow */
import React from "react";

import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";

import ConfigurationMapBooleanValue
  from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapTable from "../components/ConfigurationMapTable";

const BOOLEAN_OPTIONS = {
  truthy: "TRUE",
  falsy: "FALSE"
};

type Props = {
  artifacts?: Array<any>,
  index?: number,
  onEditClick?: Function,
};

class PodContainerArtifactsConfigSection extends React.Component {

  getColumns() {
    return [
      {
        heading: "Artifact URI",
        prop: "uri"
      },
      {
        heading: "Executable",
        prop: "executable",
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]}
            />
          );
        }
      },
      {
        heading: "Extract",
        prop: "extract",
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]}
            />
          );
        }
      },
      {
        heading: "Cache",
        prop: "cache",
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]}
            />
          );
        }
      },
      {
        heading: "Destination Path",
        prop: "destPath"
      }
    ];
  }

  render() {
    const { artifacts, index, onEditClick } = this.props;
    let tabViewID = "services";
    if (index != null) {
      tabViewID = `container${index}`;
    }

    if (!artifacts || !artifacts.length) {
      return <noscript />;
    }

    return (
      <div>
        <ConfigurationMapHeading level={3}>
          Container Artifacts
        </ConfigurationMapHeading>
        <ConfigurationMapTable
          columnDefaults={{ hideIfEmpty: true }}
          columns={this.getColumns()}
          data={artifacts}
          onEditClick={onEditClick}
          tabViewID={tabViewID}
        />
      </div>
    );
  }
}

PodContainerArtifactsConfigSection.defaultProps = {
  artifacts: []
};

module.exports = PodContainerArtifactsConfigSection;
