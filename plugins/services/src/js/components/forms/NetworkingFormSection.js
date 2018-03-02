import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";

import { findNestedPropertyInObject, isObject } from "#SRC/js/utils/Util";
import { SET } from "#SRC/js/constants/TransactionTypes";
import AddButton from "#SRC/js/components/form/AddButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import Icon from "#SRC/js/components/Icon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import Networking from "#SRC/js/constants/Networking";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import VirtualNetworksStore from "#SRC/js/stores/VirtualNetworksStore";
import SingleContainerPortDefinitions
  from "../../reducers/serviceForm/FormReducers/SingleContainerPortDefinitionsReducer";
import SingleContainerPortMappings
  from "../../reducers/serviceForm/FormReducers/SingleContainerPortMappingsReducer";
import {
  FormReducer as networks
} from "../../reducers/serviceForm/FormReducers/Networks";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";

const { BRIDGE, HOST, CONTAINER } = Networking.type;

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
    const networkType =
      findNestedPropertyInObject(this.props.data, "networks.0.mode") || HOST;

    return networkType === HOST;
  }

  getHostPortFields(portDefinition, index) {
    let hostPortValue = portDefinition.hostPort;
    const { errors, data: { portsAutoAssign } } = this.props;
    const hostPortError =
      findNestedPropertyInObject(errors, `portDefinitions.${index}.port`) ||
      findNestedPropertyInObject(
        errors,
        `container.portMappings.${index}.hostPort`
      );
    const isInputDisabled = this.isHostNetwork()
      ? portsAutoAssign
      : portDefinition.automaticPort;

    let placeholder;

    if (isInputDisabled) {
      placeholder = `$PORT${index}`;
      hostPortValue = "";
    }

    const tooltipContent = (
      <span>
        {`This host port will be accessible as an environment variable called '$PORT${index}'. `}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/"
          )}
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
                wrapText={true}
              >
                <Icon color="light-grey" id="circle-question" size="mini" />
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
        `container.portMappings.${index}.labels`
      );

    if (isObject(loadBalancedError)) {
      vipPortError = loadBalancedError[`VIP_${index}`];
      loadBalancedError = null;
    }

    const loadBalancerDocsURI = MetadataStore.buildDocsURI(
      "/deploying-services/service-endpoints/"
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
                  wrapperClassName="tooltip-wrapper text-align-center"
                  wrapText={true}
                >
                  <Icon color="light-grey" id="circle-question" size="mini" />
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
                  wrapText={true}
                >
                  <Icon color="light-grey" id="circle-question" size="mini" />
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
              <FieldAutofocus>
                <FieldInput
                  min="1"
                  placeholder={placeholder}
                  name={`portDefinitions.${index}.vipPort`}
                  type="number"
                  value={vipPort}
                />
              </FieldAutofocus>
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
        `container.portMappings.${index}.protocol`
      );

    const assignHelpText = (
      <span>
        {"Most services will use TCP. "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/"
          )}
          target="_blank"
        >
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
                wrapText={true}
              >
                <Icon color="light-grey" id="circle-question" size="mini" />
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
        `container.portMappings.${index}.containerPort`
      );

    return (
      <FormGroup className="column-3" showError={Boolean(containerPortError)}>
        <FieldLabel>
          Container Port
        </FieldLabel>
        <FieldAutofocus>
          <FieldInput
            min="0"
            name={`portDefinitions.${index}.containerPort`}
            type="number"
            value={portDefinition.containerPort}
          />
        </FieldAutofocus>
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
    const { errors, data: { networks } } = this.props;
    const networkType = findNestedPropertyInObject(networks, "0.mode") || HOST;

    const endpoints = this.isHostNetwork()
      ? this.props.data.portDefinitions
      : this.props.data.portMappings;

    return endpoints.map((endpoint, index) => {
      let portMappingFields = null;

      const nameError =
        findNestedPropertyInObject(errors, `portDefinitions.${index}.name`) ||
        findNestedPropertyInObject(
          errors,
          `container.portMappings.${index}.name`
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
                      wrapperClassName="tooltip-wrapper text-align-center"
                      wrapText={true}
                    >
                      <Icon
                        color="light-grey"
                        id="circle-question"
                        size="mini"
                      />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldAutofocus>
                <FieldInput
                  name={`portDefinitions.${index}.name`}
                  type="text"
                  value={endpoint.name}
                />
              </FieldAutofocus>
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
    const networkMode = findNestedPropertyInObject(
      this.props.data,
      "networks.0.mode"
    );
    const networkName = findNestedPropertyInObject(
      this.props.data,
      "networks.0.name"
    );
    const selectedValue = networkName
      ? `${networkMode}.${networkName}`
      : networkMode;

    const selections = (
      <FieldSelect name="networks.0.network" value={selectedValue}>
        <option value={HOST}>
          Host
        </option>
        <option value={BRIDGE}>
          Bridge
        </option>
        {this.getVirtualNetworks()}
      </FieldSelect>
    );

    return selections;
  }

  getServiceEndpointsSection() {
    const serviceEndpointsDocsURI = MetadataStore.buildDocsURI(
      "/deploying-services/service-endpoints/"
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
            wrapperClassName="tooltip-wrapper text-align-center"
            wrapText={true}
          >
            <Icon color="light-grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    );

    return (
      <div>
        <h2 className="short-bottom" key="service-endpoints-header">
          {heading}
        </h2>
        <p key="service-endpoints-description">
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
        </p>
        {this.isHostNetwork() && this.getHostNetworkPortsAutoAssignSection()}
        {this.getServiceEndpoints()}
        <FormRow key="service-endpoints-add-button">
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
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
        <FieldLabel>&nbsp;</FieldLabel>
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
      "networks"
    );

    let { networks } = this.props.data;

    const tooltipContent = (
      <span>
        {
          "Choose container/bridge, host, or container networking. Refer to the "
        }
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/"
          )}
          target="_blank"
        >
          ports documentation
        </a> for more information.
      </span>
    );

    if (networks != null && networks.length > 1) {
      networks = networks.map(function({ mode, name }) {
        return {
          name,
          mode: Networking.internalToJson[mode]
        };
      });

      return (
        <div>
          <h2 className="flush-top short-bottom">
            Networking
          </h2>
          <p>
            {"This service has advanced networking configuration, which we" +
              " don't currently support in the UI. Please use the JSON editor" +
              " to make changes."}
          </p>
          <pre>
            {JSON.stringify(networks, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div>
        <h1 className="flush-top short-bottom">
          Networking
        </h1>
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
                    wrapText={true}
                  >
                    <Icon color="light-grey" id="circle-question" size="mini" />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            {this.getTypeSelections()}
            <FieldError>{networkError}</FieldError>
          </FormGroup>
        </FormRow>
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
  data: PropTypes.object,
  errors: PropTypes.object,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func
};

NetworkingFormSection.configReducers = {
  networks,
  portDefinitions: SingleContainerPortDefinitions,
  portMappings: SingleContainerPortMappings,
  portsAutoAssign(state, { type, path = [], value }) {
    const joinedPath = path.join(".");

    if (type === SET && joinedPath === "portsAutoAssign") {
      return value;
    }

    return state;
  }
};

module.exports = NetworkingFormSection;
