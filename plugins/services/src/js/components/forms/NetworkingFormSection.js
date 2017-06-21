import React from "react";
import { Tooltip } from "reactjs-components";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";

import {
  findNestedPropertyInObject,
  isObject
} from "../../../../../../src/js/utils/Util";
import SingleContainerPortDefinitions
  from "../../reducers/serviceForm/FormReducers/SingleContainerPortDefinitionsReducer";
import SingleContainerPortMappings
  from "../../reducers/serviceForm/FormReducers/SingleContainerPortMappingsReducer";
import { SET } from "../../../../../../src/js/constants/TransactionTypes";
import AddButton from "../../../../../../src/js/components/form/AddButton";
import ContainerConstants from "../../constants/ContainerConstants";
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
import MetadataStore from "../../../../../../src/js/stores/MetadataStore";
import Networking from "../../../../../../src/js/constants/Networking";
import VirtualNetworksStore
  from "../../../../../../src/js/stores/VirtualNetworksStore";
import ValidatorUtil from "../../../../../../src/js/utils/ValidatorUtil";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";

const { BRIDGE, HOST, USER } = Networking.type;
const { MESOS, NONE } = ContainerConstants.type;

const METHODS_TO_BIND = ["onVirtualNetworksStoreSuccess"];

class NetworkingFormSection extends mixin(StoreMixin) {
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

  isHostNetwork() {
    const { networkType = HOST } = this.props.data;

    return networkType === HOST;
  }

  getHostPortFields(portDefinition, index) {
    let hostPortValue = portDefinition.hostPort;
    const { errors, data: { portsAutoAssign } } = this.props;
    const hostPortError =
      findNestedPropertyInObject(errors, `portDefinitions.${index}.port`) ||
      findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.hostPort`
      );
    const isInputDisabled = this.isHostNetwork()
      ? portsAutoAssign
      : portDefinition.automaticPort;

    let placeholder;

    if (isInputDisabled) {
      placeholder = `$PORT${index}`;
      hostPortValue = null;
    }

    const tooltipContent = (
      <span>
        {`This host port will be accessible as an environment variable called '$PORT${index}'. `}
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
        className="column-3"
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
          disabled={isInputDisabled}
          placeholder={placeholder}
          min="0"
          name={`portDefinitions.${index}.hostPort`}
          type="number"
          value={hostPortValue}
        />
        <FieldError>{hostPortError}</FieldError>
      </FormGroup>,
      !this.isHostNetwork() &&
        this.getNonHostNetworkPortsAutoAssignSection(portDefinition, index)
    ];
  }

  getLoadBalancedServiceAddressField(endpoint, index) {
    const { errors } = this.props;
    const { loadBalanced } = endpoint;
    let vipPortError = null;
    let loadBalancedError =
      findNestedPropertyInObject(errors, `portDefinitions.${index}.labels`) ||
      findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.labels`
      );

    if (isObject(loadBalancedError)) {
      vipPortError = loadBalancedError[`VIP_${index}`];
      loadBalancedError = null;
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

    return [
      <FormRow key="lb-enable">
        <FormGroup
          className="column-12"
          showError={Boolean(vipPortError || loadBalancedError)}
        >
          <FieldLabel>
            <FieldInput
              checked={loadBalanced}
              name={`portDefinitions.${index}.loadBalanced`}
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
          </FieldLabel>
        </FormGroup>
      </FormRow>,
      loadBalanced && this.getLoadBalancedPortField(endpoint, index)
    ];
  }

  getLoadBalancedPortField(endpoint, index) {
    const { errors, data: { id, portsAutoAssign } } = this.props;
    const { hostPort, containerPort, vip, vipPort } = endpoint;
    const defaultVipPort = this.isHostNetwork() ? hostPort : containerPort;

    // clear placeholder when HOST network portsAutoAssign is true
    const placeholder = this.isHostNetwork() && portsAutoAssign
      ? ""
      : defaultVipPort;

    let vipPortError = null;
    let loadBalancedError =
      findNestedPropertyInObject(errors, `portDefinitions.${index}.labels`) ||
      findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.labels`
      );

    const tooltipContent =
      "This port will be used to load balance this service address internally";
    if (isObject(loadBalancedError)) {
      vipPortError = loadBalancedError[`VIP_${index}`];
      loadBalancedError = null;
    }

    let address = vip;

    if (address == null) {
      let port = "";
      if (!portsAutoAssign && !ValidatorUtil.isEmpty(hostPort)) {
        port = hostPort;
      }
      if (!ValidatorUtil.isEmpty(containerPort)) {
        port = containerPort;
      }
      if (!ValidatorUtil.isEmpty(vipPort)) {
        port = vipPort;
      }

      address = `${id}:${port}`;
    }

    let hostName = null;
    if (!vipPortError) {
      hostName = ServiceConfigUtil.buildHostNameFromVipLabel(address);
    }

    const helpText = (
      <FieldHelp>
        Load balance this service internally at {hostName}
      </FieldHelp>
    );

    return (
      <FormRow key="lb-port">
        <FormGroup className="column-12">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Load Balanced Port
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
          <FormRow>
            <FormGroup
              className="column-3"
              key="vip-port"
              showError={Boolean(vipPortError)}
            >
              <FieldInput
                min="1"
                placeholder={placeholder}
                name={`portDefinitions.${index}.vipPort`}
                type="number"
                value={vipPort}
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup className="column-12" showError={Boolean(vipPortError)}>
              <FieldError>{vipPortError}</FieldError>
              {!vipPortError && helpText}
            </FormGroup>
          </FormRow>
        </FormGroup>
      </FormRow>
    );
  }

  getProtocolField(portDefinition, index) {
    const { errors } = this.props;
    const protocolError =
      findNestedPropertyInObject(errors, `portDefinitions.${index}.protocol`) ||
      findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.protocol`
      );

    const assignHelpText = (
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
                content={assignHelpText}
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
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={portDefinition.protocol.udp}
                name={`portDefinitions.${index}.protocol.udp`}
                type="checkbox"
              />
              UDP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={portDefinition.protocol.tcp}
                name={`portDefinitions.${index}.protocol.tcp`}
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

  getContainerPortField(portDefinition, network, errors, index) {
    if (network == null || network === HOST) {
      return null;
    }

    const containerPortError =
      findNestedPropertyInObject(
        errors,
        `portDefinitions.${index}.containerPort`
      ) ||
      findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.containerPort`
      );

    return (
      <FormGroup className="column-3" showError={Boolean(containerPortError)}>
        <FieldLabel>
          Container Port
        </FieldLabel>
        <FieldInput
          min="0"
          name={`portDefinitions.${index}.containerPort`}
          type="number"
          value={portDefinition.containerPort}
        />
        <FieldError>{containerPortError}</FieldError>
      </FormGroup>
    );
  }

  /**
   * This field is actually not present in the appConfig, but is generated by
   * the reducers, so we empower the user to show and hide fields
   * @param  {Object} portDefinition, the portDefinition to turn port mapping on
   * and off ofr
   * @param  {String} network, type of network
   * @param  {Number} index, position of port definition in the
   * portDefinitions array
   * @return {Component} Checkbox for turning port mapping on and off
   */
  getPortMappingCheckbox(portDefinition, network, index) {
    if ([BRIDGE, HOST].includes(network)) {
      return null;
    }

    return (
      <FormGroup className="column-3">
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Port Mapping
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={portDefinition.portMapping}
            name={`portDefinitions.${index}.portMapping`}
            type="checkbox"
          />
          Enabled
        </FieldLabel>
      </FormGroup>
    );
  }

  getServiceEndpoints() {
    const { errors, data: { networkType = HOST } } = this.props;

    const endpoints = this.isHostNetwork()
      ? this.props.data.portDefinitions
      : this.props.data.portMappings;

    return endpoints.map((endpoint, index) => {
      let portMappingFields = null;

      const nameError =
        findNestedPropertyInObject(errors, `portDefinitions.${index}.name`) ||
        findNestedPropertyInObject(
          errors,
          `container.docker.portMappings.${index}.name`
        );

      if (endpoint.portMapping || [BRIDGE, HOST].includes(networkType)) {
        portMappingFields = (
          <FormRow>
            {this.getHostPortFields(endpoint, index)}
            {this.getProtocolField(endpoint, index)}
          </FormRow>
        );
      }

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: index,
            path: "portDefinitions"
          })}
        >
          <FormRow>
            {this.getContainerPortField(endpoint, networkType, errors, index)}
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    Service Endpoint Name
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content="Name your endpoint to search for it by a meaningful name, rather than the port number."
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
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={endpoint.name}
              />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
            {this.getPortMappingCheckbox(endpoint, networkType, index)}
          </FormRow>
          {portMappingFields}
          {this.getLoadBalancedServiceAddressField(endpoint, index)}
        </FormGroupContainer>
      );
    });
  }

  getVirtualNetworks(disabledMap) {
    return VirtualNetworksStore.getOverlays()
      .mapItems(overlay => {
        const name = overlay.getName();

        return {
          text: `Virtual Network: ${name}`,
          value: `${USER}.${name}`
        };
      })
      .getItems()
      .map((virtualNetwork, index) => {
        return (
          <option
            key={index}
            disabled={Boolean(disabledMap[USER])}
            value={virtualNetwork.value}
          >
            {virtualNetwork.text}
          </option>
        );
      });
  }

  getTypeSelections() {
    const { container } = this.props.data;
    const type = findNestedPropertyInObject(container, "type");
    const network = findNestedPropertyInObject(this.props.data, "networkType");
    const disabledMap = {};

    // Runtime is Mesos
    if (!type || type === NONE) {
      disabledMap[BRIDGE] =
        "BRIDGE networking is not compatible with the Mesos runtime";
    }

    // Runtime is Universal Container Runtime
    if (type === MESOS) {
      disabledMap[BRIDGE] =
        "BRIDGE networking is not compatible with the Universal Container Runtime";
    }

    const tooltipContent = Object.keys(disabledMap)
      .filter(function(key) {
        return disabledMap[key];
      })
      .map(function(key) {
        return disabledMap[key];
      })
      .join(", ");

    const selections = (
      <FieldSelect name="container.docker.network" value={network}>
        <option disabled={Boolean(disabledMap[HOST])} value={HOST}>
          Host
        </option>
        <option disabled={Boolean(disabledMap[BRIDGE])} value={BRIDGE}>
          Bridge
        </option>
        {this.getVirtualNetworks(disabledMap)}
      </FieldSelect>
    );

    if (!tooltipContent) {
      return selections;
    }

    return (
      <Tooltip
        content={tooltipContent + "."}
        interactive={true}
        maxWidth={300}
        scrollContainer=".gm-scroll-view"
        wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
        wrapText={true}
      >
        {selections}
      </Tooltip>
    );
  }

  getServiceEndpointsSection() {
    const { portDefinitions, container, networkType } = this.props.data;
    const type = findNestedPropertyInObject(container, "type");
    const isMesosRuntime = !type || type === NONE;
    const isUniversalContainerizer = !type || type === MESOS;
    const isUserNetwork = networkType && networkType.startsWith(USER);
    const isBridgeNetwork = networkType && networkType.startsWith(BRIDGE);

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
    const heading = (
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
    );

    // Mesos Runtime doesn't support Service Endpoints for the USER network
    if (
      (isMesosRuntime || isUniversalContainerizer) &&
      (isUserNetwork || isBridgeNetwork)
    ) {
      const tooltipMessage = `Service Endpoints are not available in the ${ContainerConstants.labelMap[type]}`;

      return (
        <Tooltip
          content={tooltipMessage}
          maxWidth={500}
          scrollContainer=".gm-scroll-view"
          wrapperClassName="tooltip-wrapper tooltip-block-wrapper"
          wrapText={true}
        >
          <h3 className="short-bottom muted" key="service-endpoints-header">
            {heading}
          </h3>
          <p key="service-endpoints-description">
            DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
          </p>
        </Tooltip>
      );
    }

    return (
      <div>
        <h3 className="short-bottom" key="service-endpoints-header">
          {heading}
        </h3>
        <p key="service-endpoints-description">
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
        </p>
        {this.getServiceEndpoints()}
        <FormRow key="service-endpoints-add-button">
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                value: portDefinitions.length,
                path: "portDefinitions"
              })}
            >
              Add Service Endpoint
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }

  getHostNetworkPortsAutoAssignSection() {
    const portsAutoAssignValue = this.props.data.portsAutoAssign;

    return (
      <div>
        <h3 className="short-bottom" key="service-endpoints-header">
          Ports Auto Assign
        </h3>
        <p key="service-endpoints-description">
          DC/OS can automatically assign ports
        </p>
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={portsAutoAssignValue}
            name="portsAutoAssign"
            type="checkbox"
          />
          Assign Host Ports Automatically
        </FieldLabel>
      </div>
    );
  }

  getNonHostNetworkPortsAutoAssignSection(endpoint, index) {
    return (
      <FormGroup className="column-auto flush-left" key="assign-automatically">
        <FieldLabel />
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={endpoint.automaticPort}
            name={`portDefinitions.${index}.automaticPort`}
            type="checkbox"
          />
          Assign Automatically
        </FieldLabel>
      </FormGroup>
    );
  }

  render() {
    const networkError = findNestedPropertyInObject(
      this.props.errors,
      "container.docker.network"
    );

    const tooltipContent = (
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

    return (
      <div>
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
            {this.getTypeSelections()}
            <FieldError>{networkError}</FieldError>
          </FormGroup>
        </FormRow>
        {this.isHostNetwork() && this.getHostNetworkPortsAutoAssignSection()}
        {this.getServiceEndpointsSection()}
      </div>
    );
  }
}

NetworkingFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

NetworkingFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

NetworkingFormSection.configReducers = {
  portDefinitions: SingleContainerPortDefinitions,
  portMappings: SingleContainerPortMappings,
  portsAutoAssign(state, { type, path = [], value }) {
    const joinedPath = path.join(".");

    if (type === SET && joinedPath === "portsAutoAssign") {
      return value;
    }

    return state;
  },
  networkType(state, { type, path = [], value }) {
    const joinedPath = path.join(".");

    if (type === SET && joinedPath === "container.docker.network") {
      return value;
    }

    return state;
  }
};

module.exports = NetworkingFormSection;
