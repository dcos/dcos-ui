import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";
import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigUtil from "../utils/ServiceConfigUtil";
import ConfigurationMapValueWithDefault from "../components/ConfigurationMapValueWithDefault";

const NETWORK_MODE_NAME = {
  container: i18nMark("Container"),
  host: i18nMark("Host")
};

function getNetworkTypes(networks, i18n) {
  if (!networks || !networks.length) {
    return null;
  }

  return networks
    .map(({ mode }) => {
      return i18n ? i18n._(NETWORK_MODE_NAME[mode]) : NETWORK_MODE_NAME[mode];
    })
    .join(", ");
}

function getNetworkNames(networks) {
  if (!networks || !networks.length) {
    return null;
  }

  return networks.map(({ name }) => name).join(", ");
}

class PodNetworkConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading() {
          return <Trans render="span">Name</Trans>;
        },
        prop: "name"
      },
      {
        heading() {
          return <Trans render="span">Protocol</Trans>;
        },
        prop: "protocol"
      },
      {
        heading() {
          return <Trans render="span">Port</Trans>;
        },
        prop: "port"
      },
      {
        heading() {
          return <Trans render="span">Load Balanced Address</Trans>;
        },
        prop: "lbAddress",
        placeholder: <Trans render="em">Not Enabled</Trans>
      },
      {
        heading() {
          return <Trans render="span">Container</Trans>;
        },
        prop: "container"
      }
    ];
  }

  render() {
    const { onEditClick, i18n } = this.props;
    const appConfig = this.props.appConfig;
    const { containers = [] } = appConfig;
    const endpoints = containers.reduce((memo, container) => {
      const { endpoints = [] } = container;

      return memo.concat(
        endpoints.map(({ containerPort, labels = {}, name, protocol }) => {
          const lbAddress = Object.keys(labels).reduce((memo, label) => {
            if (ServiceConfigUtil.matchVIPLabel(label)) {
              memo.push(
                ServiceConfigUtil.buildHostNameFromVipLabel(labels[label])
              );
            }

            return memo;
          }, []);

          return {
            name,
            protocol,
            port: containerPort,
            lbAddress: lbAddress.join(", "),
            container: ServiceConfigDisplayUtil.getContainerNameWithIcon(
              container
            )
          };
        })
      );
    }, []);

    if (!endpoints.length) {
      return <noscript />;
    }

    let action;
    if (onEditClick) {
      action = (
        <a
          className="button button-link flush table-display-on-row-hover"
          onClick={onEditClick.bind(null, "networking")}
        >
          <Trans>Edit</Trans>
        </a>
      );
    }

    return (
      <div>
        <Trans render={<ConfigurationMapHeading level={1} />}>Networking</Trans>
        <ConfigurationMapSection key="pod-general-section">
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:Pod:Network"
            appConfig={appConfig}
            onEditClick={onEditClick}
          >
            {/* General section */}
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Network Type</Trans>
              <ConfigurationMapValueWithDefault
                value={getNetworkTypes(appConfig.networks, i18n)}
              />
              {action}
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>Network Name</ConfigurationMapLabel>
              <ConfigurationMapValueWithDefault
                value={getNetworkNames(appConfig.networks)}
              />
              {action}
            </ConfigurationMapRow>
          </MountService.Mount>
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:Pod:ServiceEndpoints"
            appConfig={appConfig}
            onEditClick={onEditClick}
          >
            {/* Service endpoints */}
            <Trans render={<ConfigurationMapHeading level={3} />}>
              Service Endpoints
            </Trans>
            <ConfigurationMapTable
              columnDefaults={{ hideIfEmpty: true }}
              columns={this.getColumns()}
              data={endpoints}
              onEditClick={onEditClick}
              tabViewID="networking"
            />
          </MountService.Mount>
        </ConfigurationMapSection>
      </div>
    );
  }
}

PodNetworkConfigSection.defaultProps = {
  appConfig: {}
};

PodNetworkConfigSection.propTypes = {
  appConfig: PropTypes.object,
  onEditClick: PropTypes.func
};

module.exports = withI18n()(PodNetworkConfigSection);
