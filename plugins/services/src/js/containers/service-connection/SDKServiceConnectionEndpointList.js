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
import RouterUtil from "#SRC/js/utils/RouterUtil";
import Icon from "#SRC/js/components/Icon";

import Service from "../../structs/Service";
import EndpointClipboardTrigger from "./EndpointClipboardTrigger";
import ServiceNoEndpointsPanel from "./ServiceNoEndpointsPanel";
import SDKEndpointActions from "../../events/SDKEndpointActions";
import SDKEndpointStore from "../../stores/SDKEndpointStore";
import { EDIT } from "../../constants/ServiceActionItem";
import ServiceActionDisabledModal
  from "../../components/modals/ServiceActionDisabledModal";

class SDKServiceConnectionEndpointList extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionDisabledModalOpen: false,
      servicePreviousState: ""
    };
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
    return <EndpointClipboardTrigger command={command} />;
  }

  getJSONEndpoint(endpoint, key) {
    return (
      <ConfigurationMapSection key={key}>
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

  getFileEndpoint(endpoint, key) {
    return (
      <ConfigurationMapRow key={key}>
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
    if (!Array.isArray(endpoints)) {
      return null;
    }

    return endpoints
      .filter(endpoint => {
        return endpoint.isJSON();
      })
      .map((endpoint, index) => {
        return this.getJSONEndpoint(endpoint, index);
      });
  }

  getFileEndpoints(endpoints) {
    if (!Array.isArray(endpoints)) {
      return null;
    }

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
        {fileEndpoints.map((endpoint, index) => {
          return this.getFileEndpoint(endpoint, index);
        })}
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
          serviceId={service.getId()}
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
  service: React.PropTypes.instanceOf(Service)
};

module.exports = SDKServiceConnectionEndpointList;
