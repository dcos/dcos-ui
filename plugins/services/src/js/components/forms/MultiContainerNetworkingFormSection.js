import React from "react";
import { Tooltip } from "reactjs-components";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";

import {
  findNestedPropertyInObject,
  isObject
} from "../../../../../../src/js/utils/Util";
import {
  FormReducer as networks
} from "../../reducers/serviceForm/MultiContainerNetwork";
import AddButton from "../../../../../../src/js/components/form/AddButton";
import FieldError from "../../../../../../src/js/components/form/FieldError";
import FieldHelp from "../../../../../../src/js/components/form/FieldHelp";
import FieldInput from "../../../../../../src/js/components/form/FieldInput";
import FieldLabel from "../../../../../../src/js/components/form/FieldLabel";
import FieldSelect from "../../../../../../src/js/components/form/FieldSelect";
import FormGroup from "../../../../../../src/js/components/form/FormGroup";
import FormGroupContainer
  from "../../../../../../src/js/components/form/FormGroupContainer";
import FormGroupHeading
  from "../../../../../../src/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "../../../../../../src/js/components/form/FormGroupHeadingContent";
import FormRow from "../../../../../../src/js/components/form/FormRow";
import Icon from "../../../../../../src/js/components/Icon";
import Networking from "../../../../../../src/js/constants/Networking";
import MetadataStore from "../../../../../../src/js/stores/MetadataStore";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";
import VirtualNetworksStore
  from "../../../../../../src/js/stores/VirtualNetworksStore";

const { CONTAINER, HOST } = Networking.type;
const METHODS_TO_BIND = ["onVirtualNetworksStoreSuccess"];

class MultiContainerNetworkingFormSection extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = [
      {
        name: "virtualNetworks",
        events: ["success"],
        suppressUpdate: true
      }
    ];
  }

  onVirtualNetworksStoreSuccess() {
    this.forceUpdate();
  }

  getContainerPortField(endpoint, network, index, containerIndex, errors) {
    if (network !== CONTAINER) {
      return null;
    }

    const containerPortError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.containerPort`
    );

    return (
      <FormGroup
        className="column-3"
        key="container-port"
        showError={Boolean(containerPortError)}
      >
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Container Port
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldInput
          min="0"
          name={`containers.${containerIndex}.endpoints.${index}.containerPort`}
          type="number"
          value={endpoint.containerPort}
        />
        <FieldError>{containerPortError}</FieldError>
      </FormGroup>
    );
  }

  getHostPortFields(endpoint, index, containerIndex) {
    let placeholder;
    let environmentVariableName = "$ENDPOINT_{NAME}";
    if (endpoint.name && typeof endpoint.name === "string") {
      environmentVariableName = environmentVariableName.replace(
        "{NAME}",
        endpoint.name.toUpperCase()
      );
    }
    let value = endpoint.hostPort;
    const { errors } = this.props;
    const hostPortError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.port`
    );

    if (endpoint.automaticPort) {
      placeholder = environmentVariableName;
      value = null;
    }

    const tooltipContent = (
      <span>
        {`This host port will be accessible as an environment variable called ${environmentVariableName}'. `}
        <a
          href="https://mesosphere.github.io/marathon/docs/ports.html"
          target="_blank"
        >
          More information
        </a>
      </span>
    );

    return [
      <FormGroup
        className="column-4"
        key="host-port"
        showError={Boolean(hostPortError)}
      >
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Host Port
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldInput
          disabled={endpoint.automaticPort}
          placeholder={placeholder}
          min="0"
          name={`containers.${containerIndex}.endpoints.${index}.hostPort`}
          type="number"
          value={value}
        />
        <FieldError>{hostPortError}</FieldError>
      </FormGroup>,
      <FormGroup className="column-auto flush-left" key="assign-automatically">
        <FieldLabel />
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={endpoint.automaticPort}
            name={`containers.${containerIndex}.endpoints.${index}.automaticPort`}
            type="checkbox"
          />
          Assign Automatically
        </FieldLabel>
      </FormGroup>
    ];
  }

  getLoadBalancedServiceAddressField(endpoint, network, index, containerIndex) {
    if (network !== CONTAINER) {
      return null;
    }

    const { containerPort, hostPort, loadBalanced, vip } = endpoint;
    const { errors } = this.props;
    let loadBalancedError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.labels`
    );

    if (isObject(loadBalancedError)) {
      loadBalancedError = null;
    }

    let address = vip;
    if (address == null) {
      let port = "";
      if (hostPort != null && hostPort !== "") {
        port = hostPort;
      }
      if (containerPort != null && containerPort !== "") {
        port = containerPort;
      }
      port = port || 0;

      address = `${this.props.data.id}:${port}`;
    }

    const loadBalancerDocsURI = MetadataStore.buildDocsURI(
      "/usage/service-discovery/load-balancing-vips"
    );
    const loadBalancerTooltipContent = (
      <span>
        {`Load balance the service internally (layer 4), and create a service
        address. For external (layer 7) load balancing, create an external
        load balancer and attach this service. `}
        <a href={loadBalancerDocsURI} target="_blank">
          More Information
        </a>
      </span>
    );

    return (
      <FormRow>
        <FormGroup className="column-12" showError={Boolean(loadBalancedError)}>
          <FieldLabel>
            <FieldInput
              checked={loadBalanced}
              name={`containers.${containerIndex}.endpoints.${index}.loadBalanced`}
              type="checkbox"
            />
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Enable Load Balanced Service Address
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={loadBalancerTooltipContent}
                  interactive={true}
                  maxWidth={300}
                  scrollContainer=".gm-scroll-view"
                  wrapperClassName="tooltip-wrapper text-align-center"
                  wrapText={true}
                >
                  <Icon color="grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
            <FieldHelp>
              Load balance this service internally at
              {" "}
              {ServiceConfigUtil.buildHostNameFromVipLabel(address)}
            </FieldHelp>
          </FieldLabel>
          <FieldError>{loadBalancedError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getProtocolField(endpoint, index, containerIndex) {
    const { errors } = this.props;
    const protocolError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.protocol`
    );

    const assignTooltip = (
      <span>
        {"Most services will use TCP. "}
        <a href="https://mesosphere.github.io/marathon/docs/ports.html">
          More information
        </a>
        .
      </span>
    );

    return (
      <FormGroup className="column-3" showError={Boolean(protocolError)}>
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Protocol
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={assignTooltip}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FormRow>
          <FormGroup className="column-auto" key="protocol-udp">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={endpoint.protocol.udp}
                name={`containers.${containerIndex}.endpoints.${index}.protocol.udp`}
                type="checkbox"
              />
              UDP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto" key="protocol-tcp">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={endpoint.protocol.tcp}
                name={`containers.${containerIndex}.endpoints.${index}.protocol.tcp`}
                type="checkbox"
              />
              TCP
            </FieldLabel>
          </FormGroup>
        </FormRow>
        <FieldError>{protocolError}</FieldError>
      </FormGroup>
    );
  }

  getServiceContainerEndpoints(endpoints = [], containerIndex) {
    const network = findNestedPropertyInObject(
      this.props.data,
      "networks.0.mode"
    );
    const { errors } = this.props;

    return endpoints.map((endpoint, index) => {
      const nameError = findNestedPropertyInObject(
        errors,
        `containers.${containerIndex}.endpoints.${index}.name`
      );

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: index,
            path: `containers.${containerIndex}.endpoints`
          })}
        >
          <FormRow key="port-name-group">
            {this.getContainerPortField(
              endpoint,
              network,
              index,
              containerIndex,
              errors
            )}
            <FormGroup
              className="column-6"
              key="endpoint-name"
              showError={Boolean(nameError)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    Service Endpoint Name
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`containers.${containerIndex}.endpoints.${index}.name`}
                type="text"
                value={endpoint.name}
              />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          <FormRow key="host-protocol">
            {this.getHostPortFields(endpoint, index, containerIndex)}
            {this.getProtocolField(endpoint, index, containerIndex)}
          </FormRow>
          {this.getLoadBalancedServiceAddressField(
            endpoint,
            network,
            index,
            containerIndex
          )}
        </FormGroupContainer>
      );
    });
  }

  getServiceEndpoints() {
    const { containers } = this.props.data;

    return containers.map((container, index) => {
      const { endpoints = [] } = container;

      return (
        <div key={index}>
          <h4 className="short-bottom">
            <Icon id="container" size="mini" color="purple" />
            {` ${container.name}`}
          </h4>
          {this.getServiceContainerEndpoints(endpoints, index)}
          <div>
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                value: endpoints.length,
                path: `containers.${index}.endpoints`
              })}
            >
              Add Service Endpoint
            </AddButton>
          </div>
        </div>
      );
    });
  }

  getVirtualNetworks() {
    return VirtualNetworksStore.getOverlays()
      .mapItems(overlay => {
        const name = overlay.getName();

        return {
          text: `Virtual Network: ${name}`,
          value: `${CONTAINER}.${name}`
        };
      })
      .getItems()
      .map((virtualNetwork, index) => {
        return (
          <option key={index} value={virtualNetwork.value}>
            {virtualNetwork.text}
          </option>
        );
      });
  }

  getTypeSelections() {
    const networkType = findNestedPropertyInObject(
      this.props.data,
      "networks.0.mode"
    );
    const networkName = findNestedPropertyInObject(
      this.props.data,
      "networks.0.name"
    );

    let network = networkType;
    if (networkName) {
      network = `${networkType}.${networkName}`;
    }

    return (
      <FieldSelect name="networks.0" value={network}>
        <option value={HOST}>
          Host
        </option>
        {this.getVirtualNetworks()}
      </FieldSelect>
    );
  }

  render() {
    const networkError = findNestedPropertyInObject(
      this.props.errors,
      "container.docker.network"
    );

    const networkTypeTooltipContent = (
      <span>
        {"Choose BRIDGE, HOST, or USER networking. Refer to the "}
        <a
          href="https://mesosphere.github.io/marathon/docs/ports.html"
          target="_blank"
        >
          ports documentation
        </a> for more information.
      </span>
    );

    const serviceEndpointsDocsURI = MetadataStore.buildDocsURI(
      "/usage/service-discovery/load-balancing-vips/virtual-ip-addresses/"
    );
    const serviceEndpointsTooltipContent = (
      <span>
        {
          "Service endpoints map traffic from a single VIP to multiple IP addresses and ports. "
        }
        <a href={serviceEndpointsDocsURI} target="_blank">
          More Information
        </a>
      </span>
    );

    return (
      <div className="form flush-bottom">
        <h2 className="flush-top short-bottom">
          Networking
        </h2>
        <p>
          Configure the networking for your service.
        </p>
        <FormRow>
          <FormGroup className="column-6" showError={Boolean(networkError)}>
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  Network Type
                </FormGroupHeadingContent>
                <FormGroupHeadingContent>
                  <Tooltip
                    content={networkTypeTooltipContent}
                    interactive={true}
                    maxWidth={300}
                    scrollContainer=".gm-scroll-view"
                    wrapText={true}
                  >
                    <Icon color="grey" id="circle-question" size="mini" />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            {this.getTypeSelections()}
            <FieldHelp>
              The network type will be shared across all your containers.
            </FieldHelp>
            <FieldError>{networkError}</FieldError>
          </FormGroup>
        </FormRow>
        <h3 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Service Endpoints
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={serviceEndpointsTooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapperClassName="tooltip-wrapper text-align-center"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h3>
        <p>
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints
        </p>
        {this.getServiceEndpoints()}
      </div>
    );
  }
}

MultiContainerNetworkingFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

MultiContainerNetworkingFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

MultiContainerNetworkingFormSection.configReducers = {
  networks
};

module.exports = MultiContainerNetworkingFormSection;
