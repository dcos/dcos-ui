import PropTypes from "prop-types";
import * as React from "react";
import { MountService } from "foundation-ui";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";

import ConfigurationMapBooleanValue from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapTable from "../components/ConfigurationMapTable";

const BOOLEAN_OPTIONS = {
  truthy: i18nMark("TRUE"),
  falsy: i18nMark("FALSE"),
};

class PodContainerArtifactsConfigSection extends React.Component {
  static defaultProps = {
    artifacts: [],
  };
  static propTypes = {
    artifacts: PropTypes.array,
    index: PropTypes.number,
    onEditClick: PropTypes.func,
  };
  getColumns() {
    return [
      {
        heading() {
          return <Trans render="span">Artifact URI</Trans>;
        },
        prop: "uri",
      },
      {
        heading() {
          return <Trans render="span">Executable</Trans>;
        },
        prop: "executable",
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]}
            />
          );
        },
      },
      {
        heading() {
          return <Trans render="span">Extract</Trans>;
        },
        prop: "extract",
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]}
            />
          );
        },
      },
      {
        heading() {
          return <Trans render="span">Cache</Trans>;
        },
        prop: "cache",
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]}
            />
          );
        },
      },
      {
        heading() {
          return <Trans render="span">Destination Path</Trans>;
        },
        prop: "destPath",
      },
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
        <Trans render={<ConfigurationMapHeading level={3} />}>
          Container Artifacts
        </Trans>
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

export default PodContainerArtifactsConfigSection;
