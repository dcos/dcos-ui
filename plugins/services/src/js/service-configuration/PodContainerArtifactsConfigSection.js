import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";

import ConfigurationMapBooleanValue from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapTable from "../components/ConfigurationMapTable";

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
      <MountService.Mount
        type="CreateService:ServiceConfigDisplay:Pod:Container:General:Artifacts"
        artifacts={artifacts}
        onEditClick={onEditClick}
      >
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
      </MountService.Mount>
    );
  }
}

PodContainerArtifactsConfigSection.defaultProps = {
  artifacts: []
};

PodContainerArtifactsConfigSection.propTypes = {
  artifacts: PropTypes.array,
  index: PropTypes.number,
  onEditClick: PropTypes.func
};

module.exports = PodContainerArtifactsConfigSection;
