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
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import Icon from "#SRC/js/components/Icon";

import Service from "../../structs/Service";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";
import { getDisplayValue } from "../../utils/ServiceConfigDisplayUtil";

const METHODS_TO_BIND = ["handleOpenEditConfigurationModal", "handleTextCopy"];

class ServiceConnectionContainer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      copiedCommand: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleTextCopy(copiedCommand) {
    this.setState({ copiedCommand });
  }

  handleOpenEditConfigurationModal() {
    const { router } = this.context;
    router.push(
      `/services/detail/${encodeURIComponent(this.props.service.getId())}/edit/`
    );
  }

  getClipboardTrigger(command) {
    return (
      <div className="code-copy-wrapper">
        <div className="code-copy-icon tight">
          <ClipboardTrigger
            className="clickable"
            copyText={command}
            onTextCopy={this.handleTextCopy.bind(this, command)}
            useTooltip={true}
          >
            <Icon id="clipboard" size="mini" ref="copyButton" color="grey" />
          </ClipboardTrigger>
        </div>
        {command}
      </div>
    );
  }

  getProtocolValue(portDefinition) {
    let protocol = portDefinition.protocol || "";
    if (protocol instanceof Array) {
      protocol = protocol.join(", ");
    }
    protocol = protocol.replace(/,\s*/g, ", ");

    return this.getClipboardTrigger(getDisplayValue(protocol));
  }

  getHostPortValue(portDefinition) {
    const service = this.props.service;
    const hostPort = service.requirePorts
      ? this.getClipboardTrigger(getDisplayValue(portDefinition.hostPort))
      : "Auto Assigned";

    return <span>{hostPort}</span>;
  }

  getLoadBalancedAddressValue(portDefinition) {
    const { port, labels } = portDefinition;
    const vipLabel = ServiceConfigUtil.findVIPLabel(labels);

    if (vipLabel) {
      return this.getClipboardTrigger(
        ServiceConfigUtil.buildHostNameFromVipLabel(labels[vipLabel], port)
      );
    }

    return <em>Not Enabled</em>;
  }

  getPortDefinitionDetails(portDefinition) {
    return (
      <div>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Protocol
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getProtocolValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Container Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {!portDefinition.containerPort ||
              portDefinition.containerPort === ""
              ? getDisplayValue(portDefinition.containerPort)
              : this.getClipboardTrigger(
                  getDisplayValue(portDefinition.containerPort)
                )}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Host Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getHostPortValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Service Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {!portDefinition.servicePort || portDefinition.servicePort === ""
              ? getDisplayValue(portDefinition.servicePort)
              : this.getClipboardTrigger(
                  getDisplayValue(portDefinition.servicePort)
                )}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Load Balanced Address
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getLoadBalancedAddressValue(portDefinition)}
          </ConfigurationMapValue>
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

    if (
      service.spec &&
      service.spec.containers &&
      service.spec.containers.length > 0
    ) {
      service.spec.containers.forEach(container => {
        endpoints = endpoints.concat(container.endpoints);
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
