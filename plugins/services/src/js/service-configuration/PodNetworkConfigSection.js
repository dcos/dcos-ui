import React from "react";

import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../src/js/components/ConfigurationMapSection";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigUtil from "../utils/ServiceConfigUtil";
import ConfigurationMapValueWithDefault
  from "../components/ConfigurationMapValueWithDefault";

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

    return (
      <div>
        <ConfigurationMapHeading level={1}>Network</ConfigurationMapHeading>
        <ConfigurationMapSection key="pod-general-section">

          {/* General section */}
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Network Type</ConfigurationMapLabel>
            <ConfigurationMapValueWithDefault
              value={getNetworkTypes(appConfig.networks)}
            />
            <ConfigurationMapEditAction
              onEditClick={onEditClick}
              tabViewID="multinetworking"
            />
          </ConfigurationMapRow>

          {/* Service endpoints */}
          <ConfigurationMapHeading level={3}>
            Service Endpoints
          </ConfigurationMapHeading>
          <ConfigurationMapTable
            columnDefaults={{ hideIfEmpty: true }}
            columns={this.getColumns()}
            data={endpoints}
            onEditClick={onEditClick}
            tabViewID="multinetworking"
          />

        </ConfigurationMapSection>
      </div>
    );
  }
}

PodNetworkConfigSection.defaultProps = {
  appConfig: {}
};

PodNetworkConfigSection.propTypes = {
  appConfig: React.PropTypes.object,
  onEditClick: React.PropTypes.func
};

module.exports = PodNetworkConfigSection;
