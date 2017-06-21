import React from "react";

import ConfigurationMapBooleanValue
  from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";

const BOOLEAN_OPTIONS = {
  truthy: "TRUE",
  falsy: "FALSE"
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

PodContainerArtifactsConfigSection.propTypes = {
  artifacts: React.PropTypes.array,
  index: React.PropTypes.number,
  onEditClick: React.PropTypes.func
};

module.exports = PodContainerArtifactsConfigSection;
