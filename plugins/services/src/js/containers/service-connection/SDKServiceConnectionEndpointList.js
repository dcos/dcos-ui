import React from "react";

import Loader from "#SRC/js/components/Loader";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Icon from "#SRC/js/components/Icon";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import RouterUtil from "#SRC/js/utils/RouterUtil";

import Service from "../../structs/Service";
import Pod from "../../structs/Pod";

import ServiceNoEndpointsPanel from "./ServiceNoEndpointsPanel";
import SDKEndpointActions from "../../events/SDKEndpointActions";
import SDKEndpointStore from "../../stores/SDKEndpointStore";
import { EDIT } from "../../constants/ServiceActionItem";
import ServiceActionDisabledModal
  from "../../components/modals/ServiceActionDisabledModal";

const METHODS_TO_BIND = ["handleTextCopy"];

class SDKServiceConnectionEndpointList extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionDisabledModalOpen: false,
      copiedCommand: "",
      servicePreviousState: ""
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleTextCopy(copiedCommand) {
    this.setState({ copiedCommand });
  }

  handleOpenEditConfigurationModal(actionDisabledModalOpen) {
    this.setState({
      actionDisabledModalOpen
    });
  }

  componentDidMount() {
    const { service } = this.props;
    SDKEndpointActions.fetchEndpoints(service.getId());
  }

  componentWillReceiveProps() {
    const { service } = this.props;
    const { servicePreviousState } = this.state;
    const serviceStatus = service.getStatus();

    if (servicePreviousState !== serviceStatus) {
      SDKEndpointActions.fetchEndpoints(service.getId());
      this.setState({ servicePreviousState: serviceStatus });
    }
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

  getJSONEndpoint(endpoint) {
    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          {endpoint.getName()}
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Address
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            <span>{this.getClipboardTrigger(endpoint.getAddress())}</span>
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            DNS
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getClipboardTrigger(endpoint.getDns())}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            VIP
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getClipboardTrigger(endpoint.getVip())}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getFileEndpoint(endpoint) {
    return (
      <ConfigurationMapRow key={endpoint.getName()}>
        <ConfigurationMapLabel>
          {endpoint.getName()}
        </ConfigurationMapLabel>
        <ConfigurationMapValue>
          <a
            className="active endpoint-download"
            download={endpoint.getName()}
            href={RouterUtil.getResourceDownloadPath(
              "text/plain",
              endpoint.getName(),
              endpoint.getData()
            )}
          >
            <span>
              <Icon
                id="download"
                className="endpoint-download-icon"
                size="mini"
              />
              {" "}
              Download
            </span>
          </a>
        </ConfigurationMapValue>
      </ConfigurationMapRow>
    );
  }

  getJSONEndpoints(endpoints) {
    const jsonEndpoints = endpoints.filter(endpoint => {
      return endpoint.isJSON();
    });

    if (jsonEndpoints.length === 0) {
      return null;
    }

    return jsonEndpoints.map(endpoint => {
      return this.getJSONEndpoint(endpoint);
    });
  }

  getFileEndpointRows(fileEndpoints) {
    return fileEndpoints.map(endpoint => {
      return this.getFileEndpoint(endpoint);
    });
  }

  getFileEndpoints(endpoints) {
    const fileEndpoints = endpoints.filter(endpoint => {
      return !endpoint.isJSON();
    });

    if (fileEndpoints.length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Files
        </ConfigurationMapHeading>
        {this.getFileEndpointRows(fileEndpoints)}
      </ConfigurationMapSection>
    );
  }

  getAlertPanelSDKDeploying() {
    return (
      <div className="endpoint-sdk-deploying">
        Endpoints for
        {" "}
        {this.props.service.getId()}
        {" "}
        will appear here once it is fully deployed and running.
      </div>
    );
  }

  render() {
    const { actionDisabledModalOpen } = this.state;
    const { service } = this.props;

    if (actionDisabledModalOpen) {
      return (
        <ServiceActionDisabledModal
          actionID={EDIT}
          open={actionDisabledModalOpen}
          onClose={this.handleOpenEditConfigurationModal.bind(this, false)}
          service={service}
        />
      );
    }

    const sdkServiceEndpoints = SDKEndpointStore.getServiceEndpoints(
      service.getId()
    );

    const sdkServiceError = SDKEndpointStore.getServiceError(service.getId());

    const endpointsLoaded =
      sdkServiceEndpoints &&
      sdkServiceEndpoints.every(endpoint => {
        return endpoint.endpointData;
      });

    if (!endpointsLoaded && !sdkServiceError) {
      return <Loader />;
    }

    if (sdkServiceError) {
      return this.getAlertPanelSDKDeploying();
    }

    if (!sdkServiceEndpoints || sdkServiceEndpoints.length === 0) {
      return (
        <ServiceNoEndpointsPanel
          serviceId={this.props.service.getId()}
          onClick={this.handleOpenEditConfigurationModal.bind(this, true)}
        />
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getJSONEndpoints(sdkServiceEndpoints)}
          {this.getFileEndpoints(sdkServiceEndpoints)}
        </ConfigurationMap>
      </div>
    );
  }
}

SDKServiceConnectionEndpointList.propTypes = {
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Pod),
    React.PropTypes.instanceOf(Service)
  ])
};

module.exports = SDKServiceConnectionEndpointList;
