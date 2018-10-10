import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigUtil from "../utils/ServiceConfigUtil";
import ConfigurationMapValueWithDefault from "../components/ConfigurationMapValueWithDefault";

const NETWORK_MODE_NAME = {
  container: "Container",
  host: "Host"
};

function getNetworkTypes(networks) {
  if (!networks || !networks.length) {
    return null;
  }

  return networks.map(({ mode }) => NETWORK_MODE_NAME[mode]).join(", ");
}

function getNetworkName(networks) {
  if (!networks || !networks.length) {
    return null;
  }
  // need to get the networks to return here for network name
}

class PodNetworkConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading: "Name",
        prop: "name"
      },
      {
        heading: "Protocol",
        prop: "protocol"
      },
      {
        heading: "Port",
        prop: "port"
      },
      {
        heading: "Load Balanced Address",
        prop: "lbAddress",
        placeholder: <em>Not Enabled</em>
      },
      {
        heading: "Container",
        prop: "container"
      }
    ];
  }

  render() {
    const { onEditClick } = this.props;
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
          Edit
        </a>
      );
    }

    return (
      <div>
        <ConfigurationMapHeading level={1}>Networking</ConfigurationMapHeading>
        <ConfigurationMapSection key="pod-general-section">
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:Pod:Network"
            appConfig={appConfig}
            onEditClick={onEditClick}
          >
            {/* General section */}
            <ConfigurationMapRow>
              <ConfigurationMapLabel>Network Type</ConfigurationMapLabel>
              <ConfigurationMapValueWithDefault
                value={getNetworkTypes(appConfig.networks)}
              />
              {action}
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>Network Name</ConfigurationMapLabel>
              <ConfigurationMapValueWithDefault
                value={getNetworkName(appConfig.networks)}
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
            <ConfigurationMapHeading level={3}>
              Service Endpoints
            </ConfigurationMapHeading>
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

module.exports = PodNetworkConfigSection;
