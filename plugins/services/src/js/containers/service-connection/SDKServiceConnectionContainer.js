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
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";

import SDKEndpointActions from "../../events/SDKEndpointActions";
import SDKEndpointStore from "../../stores/SDKEndpointStore";
import { EDIT } from "../../constants/ServiceActionItem";
import ServiceActionDisabledModal
  from "../../components/modals/ServiceActionDisabledModal";

const METHODS_TO_BIND = [
  "handleOpenEditConfigurationModal",
  "handleActionDisabledModalClose",
  "handleTextCopy"
];

class SDKServiceConnectionContainer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionDisabledModalOpen: false,
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
    this.setState({
      actionDisabledModalOpen: true
    });
  }

  handleActionDisabledModalClose() {
    this.setState({ actionDisabledModalOpen: false });
  }

  componentDidMount() {
    SDKEndpointActions.fetchEndpoints(this.props.service.getId());
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
          {endpoint.getEndpointName()}
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
      <ConfigurationMapRow>
        <ConfigurationMapLabel>
          {endpoint.getEndpointName()}
        </ConfigurationMapLabel>
        <ConfigurationMapValue>
          <a
            className="active endpoint-download"
            download={endpoint.getEndpointName()}
            href={`data:text/plain;content-disposition=attachment;filename=${endpoint.getEndpointName()};charset=utf-8,${encodeURIComponent(endpoint.getEndpointData())}`}
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
        {endpoints.map(endpoint => {
          return this.getFileEndpoint(endpoint);
        })}
      </ConfigurationMapSection>
    );
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

  getAlertPanelNoEndpoints() {
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

    if (actionDisabledModalOpen) {
      return (
        <ServiceActionDisabledModal
          actionID={EDIT}
          open={actionDisabledModalOpen}
          onClose={this.handleActionDisabledModalClose}
          service={this.props.service}
        />
      );
    }

    const sdkEndpointService = SDKEndpointStore.getSDKEndpointService(
      this.props.service.getId()
    );

    const hasErrors =
      sdkEndpointService &&
      sdkEndpointService.error !== null &&
      sdkEndpointService.error !== "";

    const isLoading =
      !sdkEndpointService ||
      sdkEndpointService.totalLoadingEndpointsCount !==
        sdkEndpointService.endpoints.length;

    if (isLoading && !hasErrors) {
      return <Loader />;
    }

    if (hasErrors) {
      return this.getAlertPanelSDKDeploying();
    }

    if (
      !sdkEndpointService.endpoints ||
      sdkEndpointService.endpoints.length === 0
    ) {
      return this.getAlertPanelNoEndpoints();
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getJSONEndpoints(sdkEndpointService.endpoints)}
          {this.getFileEndpoints(sdkEndpointService.endpoints)}
        </ConfigurationMap>
      </div>
    );
  }
}

module.exports = SDKServiceConnectionContainer;
