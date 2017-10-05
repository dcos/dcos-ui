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
import { getDisplayValue } from "../../utils/ServiceConfigDisplayUtil";

const METHODS_TO_BIND = ["handleOpenEditConfigurationModal", "handleTextCopy"];

class ServicePodConnectionEndpointList extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      copiedCommand: ""
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
    if (Array.isArray(protocol)) {
      protocol = protocol.join(", ");
    }
    protocol = protocol.replace(/,\s*/g, ", ");

    if (protocol) {
      return this.getClipboardTrigger(getDisplayValue(protocol));
    }

    return getDisplayValue(protocol);
  }

  getHostPortValue(portDefinition) {
    if (portDefinition.hostPort === 0) {
      return <span>Auto Assigned</span>;
    }

    const hostPortValue = portDefinition.hostPort;

    if (hostPortValue) {
      return this.getClipboardTrigger(getDisplayValue(hostPortValue));
    }

    return getDisplayValue(hostPortValue);
  }

  getPortDefinitions(endpoints) {
    return endpoints.map(portDefinition => {
      return (
        <ConfigurationMapSection>
          <ConfigurationMapHeading>
            {portDefinition.name}
          </ConfigurationMapHeading>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Protocol
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              <span>{this.getProtocolValue(portDefinition)}</span>
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
              Container
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              <Icon id="container" size="mini" color="purple" />
              <span>{portDefinition.containerName}</span>
            </ConfigurationMapValue>
          </ConfigurationMapRow>
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

    if (
      service.spec &&
      service.spec.containers &&
      service.spec.containers.length > 0
    ) {
      service.spec.containers.forEach(container => {
        const containerEndpoints = container.endpoints.slice(0);
        containerEndpoints.forEach(containerEndpoint => {
          containerEndpoint.containerName = container.name;
        });
        endpoints = endpoints.concat(containerEndpoints);
      });
    }

    if (!endpoints || endpoints.length === 0) {
      return (
        <AlertPanel>
          <AlertPanelHeader>No Endpoints</AlertPanelHeader>
          <p className="tall">
            There are no endpoints currently configured for
            {" "}
            {this.props.service.getId()}.
            {" "}
            You can edit the configuration to add service endpoints.
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

ServicePodConnectionEndpointList.propTypes = {
  onEditClick: React.PropTypes.func,
  errors: React.PropTypes.array,
  service: React.PropTypes.instanceOf(Service)
};

ServicePodConnectionEndpointList.contextTypes = {
  router: routerShape
};

module.exports = ServicePodConnectionEndpointList;
