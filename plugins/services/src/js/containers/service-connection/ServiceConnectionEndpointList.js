import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

import EndpointClipboardTrigger from "./EndpointClipboardTrigger";
import Service from "../../structs/Service";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";
import { getDisplayValue } from "../../utils/ServiceConfigDisplayUtil";
import MesosDNSList from "./MesosDNSList";

const METHODS_TO_BIND = ["handleOpenEditConfigurationModal"];

class ServiceConnectionEndpointList extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleOpenEditConfigurationModal() {
    const { router } = this.context;
    router.push(
      `/services/detail/${encodeURIComponent(this.props.service.getId())}/edit/`
    );
  }

  getProtocolValue(portDefinition) {
    let protocol = portDefinition.protocol || "";

    if (Array.isArray(protocol)) {
      protocol = protocol.join(",");
    }
    protocol = protocol.replace(/,\s*/g, ",");

    if (protocol !== "") {
      return <EndpointClipboardTrigger command={getDisplayValue(protocol)} />;
    }

    return getDisplayValue(protocol);
  }

  getHostPortValue(portDefinition, service) {
    if (!service.requirePorts) {
      return <Trans render="span">Auto Assigned</Trans>;
    }

    let hostPortValue = portDefinition.hostPort;

    if (!hostPortValue) {
      hostPortValue = portDefinition.port;
    }

    if (hostPortValue) {
      return (
        <EndpointClipboardTrigger
          command={getDisplayValue(hostPortValue.toString())}
        />
      );
    }

    return getDisplayValue(hostPortValue);
  }

  getLoadBalancedAddressValue(portDefinition) {
    const { port, labels } = portDefinition;
    const vipLabel = ServiceConfigUtil.findVIPLabel(labels);

    if (vipLabel) {
      const command = ServiceConfigUtil.buildHostNameFromVipLabel(
        labels[vipLabel],
        port
      );

      return <EndpointClipboardTrigger command={command} />;
    }

    return <Trans render="em">Not Enabled</Trans>;
  }

  getContainerPortValue(portDefinition) {
    const portValue = portDefinition.containerPort;

    if (portValue) {
      return (
        <EndpointClipboardTrigger
          command={getDisplayValue(portValue.toString())}
        />
      );
    }

    return getDisplayValue(portValue);
  }

  getPortDefinitionDetails(portDefinition, service) {
    return (
      <div>
        <ConfigurationMapRow key="protocol">
          <Trans render={<ConfigurationMapLabel />}>Protocol</Trans>
          <ConfigurationMapValue>
            {this.getProtocolValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="container-port">
          <Trans render={<ConfigurationMapLabel />}>Container Port</Trans>
          <ConfigurationMapValue>
            {this.getContainerPortValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="host-port">
          <Trans render={<ConfigurationMapLabel />}>Host Port</Trans>
          <ConfigurationMapValue>
            {this.getHostPortValue(portDefinition, service)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="load-balanced-address">
          <Trans render={<ConfigurationMapLabel />}>
            Load Balanced Address
          </Trans>
          <ConfigurationMapValue>
            {this.getLoadBalancedAddressValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </div>
    );
  }

  getPortDefinitions(endpoints, service) {
    return endpoints.map((portDefinition, index) => (
      <ConfigurationMapSection key={index}>
        <ConfigurationMapHeading>{portDefinition.name}</ConfigurationMapHeading>
        {this.getPortDefinitionDetails(portDefinition, service)}
      </ConfigurationMapSection>
    ));
  }

  getEndpoints(webUrl) {
    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          <Trans>Web Endpoints</Trans>
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Web URL</Trans>
          <ConfigurationMapValue>
            <EndpointClipboardTrigger
              command={webUrl[0] === "/" ? location.origin + webUrl : webUrl}
            />
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  render() {
    const { service } = this.props;
    let endpoints = [];

    if (service.instances && Array.isArray(service.instances)) {
      service.instances.forEach(instance => {
        instance.containers.forEach(container => {
          endpoints = endpoints.concat(container.endpoints);
        });
      });
    }

    if (service.portDefinitions) {
      endpoints = endpoints.concat(service.portDefinitions);
    }

    if (service.container && service.container.portMappings) {
      endpoints = endpoints.concat(service.container.portMappings);
    }

    const webUrl = service.getWebURL();

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getPortDefinitions(endpoints, service)}
          {webUrl ? this.getEndpoints(webUrl) : null}
          <MesosDNSList service={service} />
        </ConfigurationMap>
      </div>
    );
  }
}

ServiceConnectionEndpointList.propTypes = {
  onEditClick: PropTypes.func,
  errors: PropTypes.array,
  service: PropTypes.instanceOf(Service)
};

ServiceConnectionEndpointList.contextTypes = {
  router: routerShape
};

module.exports = ServiceConnectionEndpointList;
