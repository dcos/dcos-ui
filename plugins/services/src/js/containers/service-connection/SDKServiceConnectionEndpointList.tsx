import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Loader from "#SRC/js/components/Loader";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import RouterUtil from "#SRC/js/utils/RouterUtil";

import Service from "../../structs/Service";
import EndpointClipboardTrigger from "./EndpointClipboardTrigger";
import SDKEndpointActions from "../../events/SDKEndpointActions";
import SDKEndpointStore from "../../stores/SDKEndpointStore";
import MesosDNSList from "./MesosDNSList";

class SDKServiceConnectionEndpointList extends React.Component {
  static propTypes = {
    service: PropTypes.instanceOf(Service),
  };

  state = { servicePreviousState: "" };

  handleOpenEditConfigurationModal = () => {
    const { service } = this.props;
    const { router } = this.context;

    router.push(
      `/services/detail/${encodeURIComponent(service.getId())}/edit/`
    );
  };

  componentDidMount() {
    const { service } = this.props;
    SDKEndpointActions.fetchEndpoints(service.getId());
  }

  UNSAFE_componentWillReceiveProps() {
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
        <ConfigurationMapHeading>{endpoint.getName()}</ConfigurationMapHeading>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Address</Trans>
          <ConfigurationMapValue>
            <span>{this.getClipboardTrigger(endpoint.getAddress())}</span>
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>DNS</Trans>
          <ConfigurationMapValue>
            {this.getClipboardTrigger(endpoint.getDns())}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>VIP</Trans>
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
        <ConfigurationMapLabel>{endpoint.getName()}</ConfigurationMapLabel>
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
            <Trans render="span" className="endpoint-download-icon">
              <Icon shape={SystemIcons.Download} size={iconSizeXs} /> Download
            </Trans>
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
      .filter((endpoint) => endpoint.isJSON())
      .map((endpoint, index) => this.getJSONEndpoint(endpoint, index));
  }

  getFileEndpoints(endpoints) {
    if (!Array.isArray(endpoints)) {
      return null;
    }

    const fileEndpoints = endpoints.filter((endpoint) => !endpoint.isJSON());

    if (fileEndpoints.length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <Trans render={<ConfigurationMapHeading />}>Files</Trans>
        {fileEndpoints.map((endpoint, index) =>
          this.getFileEndpoint(endpoint, index)
        )}
      </ConfigurationMapSection>
    );
  }

  getAlertPanelSDKDeploying() {
    return (
      <Trans render="div" className="endpoint-sdk-deploying">
        Endpoints for {this.props.service.getId()} will appear here once it is
        fully deployed and running.
      </Trans>
    );
  }

  render() {
    const { service } = this.props;

    const sdkServiceEndpoints = SDKEndpointStore.getServiceEndpoints(
      service.getId()
    );

    const sdkServiceError = SDKEndpointStore.getServiceError(service.getId());

    const endpointsLoaded =
      sdkServiceEndpoints &&
      sdkServiceEndpoints.every((endpoint) => endpoint.endpointData);

    if (!endpointsLoaded && !sdkServiceError) {
      return <Loader />;
    }

    if (sdkServiceError) {
      return this.getAlertPanelSDKDeploying();
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getJSONEndpoints(sdkServiceEndpoints)}
          {this.getFileEndpoints(sdkServiceEndpoints)}
          <MesosDNSList service={service} />
        </ConfigurationMap>
      </div>
    );
  }
}

SDKServiceConnectionEndpointList.contextTypes = {
  router: routerShape,
};

export default SDKServiceConnectionEndpointList;
