import React from "react";
import { routerShape } from "react-router";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import Service from "../../structs/Service";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";
import { getDisplayValue } from "../../utils/ServiceConfigDisplayUtil";

const METHODS_TO_BIND = ["handleOpenEditConfigurationModal"];

class ServiceConnectionContainer extends React.Component {
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
    protocol = protocol.replace(/,\s*/g, ", ");

    return (
      <ConfigurationMapValue>{getDisplayValue(protocol)}</ConfigurationMapValue>
    );
  }

  getHostPortValue(portDefinition) {
    const service = this.props.service;
    const hostPort = service.requirePorts
      ? getDisplayValue(portDefinition.hostPort)
      : "Auto Assigned";

    return <ConfigurationMapValue>{hostPort}</ConfigurationMapValue>;
  }

  getLoadBalancedAddressValue(portDefinition) {
    const { port, labels } = portDefinition;
    const vipLabel = ServiceConfigUtil.findVIPLabel(labels);

    if (vipLabel) {
      return (
        <ConfigurationMapValue>
          {ServiceConfigUtil.buildHostNameFromVipLabel(labels[vipLabel], port)}
        </ConfigurationMapValue>
      );
    }

    return <ConfigurationMapValue><em>Not Enabled</em></ConfigurationMapValue>;
  }

  getPortDefinitionDetails(portDefinition) {
    return (
      <div>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Protocol
          </ConfigurationMapLabel>
          {this.getProtocolValue(portDefinition)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Container Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getDisplayValue(portDefinition.containerPort)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Host Port
          </ConfigurationMapLabel>
          {this.getHostPortValue(portDefinition)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Service Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getDisplayValue(portDefinition.servicePort)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Load Balanced Address
          </ConfigurationMapLabel>
          {this.getLoadBalancedAddressValue(portDefinition)}
        </ConfigurationMapRow>
      </div>
    );
  }

  getPortDefinitions(endpoints) {
    return endpoints.map(portDefinition => {
      return (
        <ConfigurationMapSection>
          <ConfigurationMapHeading>
            {portDefinition.name}
          </ConfigurationMapHeading>
          {this.getPortDefinitionDetails(portDefinition)}
        </ConfigurationMapSection>
      );
    });
  }

  getAlertPanelFooter() {
    return (
      <div className="button-collection flush-bottom">
        <button
          className="button"
          onClick={this.handleOpenEditConfigurationModal}
        >
          Edit Configuration
        </button>
      </div>
    );
  }

  render() {
    const { service } = this.props;
    let endpoints = [];
    if (service.instances && service.instances.length > 0) {
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

    if (!endpoints || endpoints.length === 0) {
      return (
        <AlertPanel>
          <AlertPanelHeader>No Endpoints</AlertPanelHeader>
          <p className="tall">
            There are no endpoints currently configured for
            {" "}
            {this.props.service.getId()}
            .You can edit the configuration to add service endpoints.
          </p>
          {this.getAlertPanelFooter()}
        </AlertPanel>
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getPortDefinitions(endpoints)}
        </ConfigurationMap>
      </div>
    );
  }
}

ServiceConnectionContainer.propTypes = {
  onEditClick: React.PropTypes.func,
  errors: React.PropTypes.array,
  service: React.PropTypes.instanceOf(Service)
};

ServiceConnectionContainer.contextTypes = {
  router: routerShape
};

module.exports = ServiceConnectionContainer;
