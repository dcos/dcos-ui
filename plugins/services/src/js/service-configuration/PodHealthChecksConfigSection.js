import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";
import { Trans } from "@lingui/macro";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ConfigurationMapDurationValue from "../components/ConfigurationMapDurationValue";
import { getContainerNameWithIcon } from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapValueWithDefault from "../components/ConfigurationMapValueWithDefault";

const COMMON_COLUMNS = [
  {
    heading: <Trans render="span">Grace Period</Trans>,
    prop: "gracePeriod",
    render(prop, row) {
      return <ConfigurationMapDurationValue units="sec" value={row[prop]} />;
    }
  },
  {
    heading: <Trans render="span">Interval</Trans>,
    prop: "interval",
    render(prop, row) {
      return <ConfigurationMapDurationValue units="sec" value={row[prop]} />;
    }
  },
  {
    heading: <Trans render="span">Timeout</Trans>,
    prop: "timeout",
    render(prop, row) {
      return <ConfigurationMapDurationValue units="sec" value={row[prop]} />;
    }
  },
  {
    heading: <Trans render="span">Max Failures</Trans>,
    prop: "maxFailures"
  },
  {
    heading: <Trans render="span">Container</Trans>,
    prop: "container"
  }
];

class PodHealthChecksConfigSection extends React.Component {
  getCommandColumns() {
    return [
      {
        heading: <Trans render="span">Command</Trans>,
        prop: "command"
      }
    ].concat(COMMON_COLUMNS);
  }

  getDefaultEndpointsColumns() {
    return {
      hideIfEmpty: true,
      render(prop, row) {
        // We use a default <Value/> renderer in order to render
        // all elements as <Div/>s. Otherwise the boolean's look
        // funny.
        return <ConfigurationMapValueWithDefault value={row[prop]} />;
      }
    };
  }

  getEndpointsColumns() {
    return [
      {
        heading: <Trans render="span">Service Endpoint</Trans>,
        prop: "endpoint"
      },
      {
        heading: <Trans render="span">Proto</Trans>,
        prop: "protocol"
      },
      {
        heading: <Trans render="span">Path</Trans>,
        prop: "path"
      }
    ].concat(COMMON_COLUMNS);
  }

  render() {
    const { onEditClick } = this.props;
    const { containers = [] } = this.props.appConfig;
    const healthChecks = containers.reduce(
      (memo, container) => {
        const { healthCheck } = container;

        if (!healthCheck) {
          return memo;
        }

        const spec = {
          interval: healthCheck.intervalSeconds,
          gracePeriod: healthCheck.gracePeriodSeconds,
          maxFailures: healthCheck.maxConsecutiveFailures,
          timeout: healthCheck.timeoutSeconds,
          container: getContainerNameWithIcon(container)
        };

        if (healthCheck.exec != null) {
          spec.command = healthCheck.exec.command.shell;
          if (healthCheck.exec.command.argv) {
            spec.command = healthCheck.exec.command.argv.join(" ");
          }

          memo.command.push(spec);
        }

        if (healthCheck.http != null) {
          spec.endpoint = healthCheck.http.endpoint;
          spec.path = healthCheck.http.path;
          spec.protocol = healthCheck.http.scheme || "http";
          memo.endpoints.push(spec);
        }

        if (healthCheck.tcp != null) {
          spec.endpoint = healthCheck.tcp.endpoint;
          spec.protocol = "tcp";
          memo.endpoints.push(spec);
        }

        return memo;
      },
      { endpoints: [], command: [] }
    );

    if (!healthChecks.endpoints.length && !healthChecks.command.length) {
      return null;
    }

    return (
      <div>
        <Trans render={<ConfigurationMapHeading level={1} />}>
          Health Checks
        </Trans>

        {healthChecks.endpoints.length !== 0 && (
          <div>
            <Trans render={<ConfigurationMapHeading level={2} />}>
              Service Endpoint Health Checks
            </Trans>
            <ConfigurationMapSection key="pod-general-section">
              <MountService.Mount
                type="CreateService:ServiceConfigDisplay:Pod:HealthChecks:Endpoint"
                appConfig={this.props.appConfig}
                onEditClick={onEditClick}
              >
                <ConfigurationMapTable
                  columnDefaults={this.getDefaultEndpointsColumns()}
                  columns={this.getEndpointsColumns()}
                  data={healthChecks.endpoints}
                  onEditClick={onEditClick}
                  tabViewID="multihealthChecks"
                />
              </MountService.Mount>
            </ConfigurationMapSection>
          </div>
        )}

        {healthChecks.command.length !== 0 && (
          <div>
            <Trans render={<ConfigurationMapHeading level={2} />}>
              Command Health Checks
            </Trans>
            <ConfigurationMapSection key="pod-general-section">
              <MountService.Mount
                type="CreateService:ServiceConfigDisplay:Pod:HealthChecks:Command"
                appConfig={this.props.appConfig}
                onEditClick={onEditClick}
              >
                <ConfigurationMapTable
                  columnDefaults={{ hideIfEmpty: true }}
                  columns={this.getCommandColumns()}
                  data={healthChecks.command}
                  onEditClick={onEditClick}
                  tabViewID="multihealthChecks"
                />
              </MountService.Mount>
            </ConfigurationMapSection>
          </div>
        )}
      </div>
    );
  }
}

PodHealthChecksConfigSection.defaultProps = {
  appConfig: {}
};

PodHealthChecksConfigSection.propTypes = {
  appConfig: PropTypes.object,
  onEditClick: PropTypes.func
};

module.exports = PodHealthChecksConfigSection;
